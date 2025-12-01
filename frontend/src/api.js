import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: 'https://vedio-app-4pme.onrender.com/api',
  timeout: 30000,
});

export default api;
