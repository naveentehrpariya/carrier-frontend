import axios from 'axios';
// const APP_URL = process.env.APP_URL || "https://carrier-backend-drab.vercel.app/";
const APP_URL = "https://logistikore.com/api";
const host = window.location.host;

let Api = axios.create({
  baseURL: host === 'localhost:3000' ? "http://localhost:8080" : APP_URL,
  withCredentials: true, // Enable cookies to be sent with requests
  headers: {
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }
}); 

// Response interceptor to handle authentication errors
Api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response);
    // If the response is successful, return it
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default Api;
