import axios from 'axios';
// const APP_URL = process.env.APP_URL || "https://carrier-backend-drab.vercel.app/";
const APP_URL = "https://logistikore.com/api";
const host = window.location.host;
function getToken(){
  const data = localStorage && localStorage.getItem('token');
  return data; 
}

let Api = axios.create({
  baseURL: host === 'localhost:3000' ? "http://localhost:8080" : APP_URL,
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

export default Api;
