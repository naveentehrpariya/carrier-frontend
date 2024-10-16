import axios from 'axios';
const APP_URL = "https://serverrai.runstream.co";
// const APP_URL = "http://localhost:8080";

function getToken(){
  const data = localStorage && localStorage.getItem('token');
  return data; 
}

let Api = axios.create({
  baseURL: APP_URL,
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
