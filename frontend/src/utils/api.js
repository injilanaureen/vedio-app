import axios from 'axios';

// Get backend URL from environment variable or use default
const getBackendUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Default to production if in production build, otherwise localhost
  return process.env.NODE_ENV === 'production' 
    ? 'https://vedio-app-4pme.onrender.com/api'
    : 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBackendUrl(),
  timeout: 30000,
});

// Export backend base URL (without /api) for video URLs
export const getBackendBaseUrl = () => {
  const apiUrl = getBackendUrl();
  return apiUrl.replace('/api', '');
};

export default api;
