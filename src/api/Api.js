import axios from 'axios';
import safeStorage from '../utils/safeStorage';
const APP_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
function getToken(){
  const data = safeStorage.getItem('token');
  return data; 
}
let Api = axios.create({
  baseURL: APP_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json'
  }
});

Api.interceptors.request.use(
  async (config) => {
    // Always set Authorization header if token exists
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging (only when enabled)
    const debugApi = process.env.REACT_APP_DEBUG_API === 'true';
    if (debugApi) {
      console.log('🔍 API Interceptor:', {
        url: config.url,
        hasToken: !!token,
        method: config.method?.toUpperCase()
      });
    }
    
    // Resolve tenant context for X-Tenant-ID header
    let tenantId = null;
    
    try {
      // Priority 1: tenantContext.tenant.tenantId (from safeStorage)
      const tenantContextRaw = safeStorage.getItem('tenantContext');
      if (tenantContextRaw) {
        const tenantContext = JSON.parse(tenantContextRaw);
        const tenant = tenantContext.tenant;
        
        if (tenant && tenant.tenantId && tenant.tenantId !== 'admin' && tenant.tenantId !== 'super-admin') {
          tenantId = tenant.tenantId;
          if (debugApi) {
            console.log('🏷️ API: Using tenantContext tenantId:', tenantId);
          }
        }
      }
      
      // Priority 2: URL ?tenant param (development fallback)
      if (!tenantId && typeof window !== 'undefined') {
        const urlTenantParam = new URLSearchParams(window.location.search).get('tenant');
        if (urlTenantParam && urlTenantParam !== 'admin') {
          tenantId = urlTenantParam;
          if (debugApi) {
            console.log('🏷️ API: Using URL tenant param:', tenantId);
          }
        }
      }
      
      // Priority 3: Subdomain (production)
      if (!tenantId && typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'admin') {
          tenantId = parts[0];
          if (debugApi) {
            console.log('🏷️ API: Using subdomain tenantId:', tenantId);
          }
        }
      }
    } catch (error) {
      // Ignore parsing errors
      if (debugApi) {
        console.warn('⚠️ API: Error resolving tenant context:', error);
      }
    }
    
    // Set X-Tenant-ID header if we have a valid tenant
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
      if (debugApi) {
        console.log('✅ API: Set X-Tenant-ID header:', tenantId);
      }
    } else if (debugApi) {
      console.log('ℹ️ API: No tenant ID - super admin context');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Api.interceptors.response.use(
  (response) => {
    try {
      const method = (response?.config?.method || '').toLowerCase();
      const url = response?.config?.url || '';
      const isMutating = ['post', 'put', 'patch', 'delete'].includes(method);
      const touchesCounters = /(\/order|\/customer|\/carriers|\/user)/.test(url);
      const ok = response?.data && (response.data.status === true || response.status < 400);
      if (isMutating && touchesCounters && ok && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sidebar-counts:refresh', { detail: { url, method } }));
      }
    } catch (e) {
      // ignore
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default Api;
