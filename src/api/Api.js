import axios from 'axios';
const APP_URL = process.env.APP_URL;
const host = window.location.host;

function getToken(){
  const data = localStorage && localStorage.getItem('token');
  return data; 
}

let Api = axios.create({
  baseURL: APP_URL ? APP_URL : 'http://localhost:8080',
  withCredentials: true, // Enable cookies for authentication
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
      return config; 
  },
  (error) => {
      return Promise.reject(error);
  }
);

// Emit a global refresh event for sidebar counts after relevant mutations
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
