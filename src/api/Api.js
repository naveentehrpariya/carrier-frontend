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

export default Api;
