import axios from 'axios';

const APP_URL = process.env.REACT_APP_API_URL || process.env.APP_URL || 'http://localhost:8080';

function getToken(){
  const data = localStorage && localStorage.getItem('token');
  return data; 
}

let Api = axios.create({
  baseURL: APP_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
    'Access-Control-Allow-Origin': '*'
  }
});

Api.interceptors.request.use(
  async (config) => {
      const token = getToken();
      if (token !== null) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      // Inject tenant context header globally if available
      try {
        const raw = localStorage.getItem('tenantContext');
        let headerSet = false;
        if (raw) {
          const parsed = JSON.parse(raw);
          const isSuperAdmin = !!parsed.isSuperAdmin;
          const tenant = parsed.tenant || {};
          const tenantId = tenant.id || tenant.subdomain || null;
          if (tenantId && !isSuperAdmin) {
            config.headers['X-Tenant-ID'] = tenantId;
            headerSet = true;
          }
        }
        // Fallback: use URL ?tenant param if header not set
        if (!headerSet && typeof window !== 'undefined') {
          const tenantParam = new URLSearchParams(window.location.search).get('tenant');
          if (tenantParam) {
            config.headers['X-Tenant-ID'] = tenantParam;
          }
        }
      } catch (e) {
        // ignore parsing errors
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
