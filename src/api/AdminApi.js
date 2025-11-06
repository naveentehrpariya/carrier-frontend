import axios from 'axios';
import safeStorage from '../utils/safeStorage';
const APP_URL = "https://serverrai.runstream.co";
// const APP_URL = "http://localhost:8080";

function getToken(){
  const data = safeStorage.getItem('admintoken');
  return data;
}

let AdminApi = axios.create({
  baseURL: APP_URL,
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
    'Access-Control-Allow-Origin': '*'
  }
});
 
AdminApi.interceptors.request.use(
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

export default AdminApi;
