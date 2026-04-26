import axios from 'axios';
import { Toast } from 'antd-mobile';

const request = axios.create({
  baseURL: '/api', // Use proxy defined in vite.config.js
  timeout: 10000,
});

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'Request failed, please try again later';
    
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('userid');
      window.location.href = '/login';
    } else {
      // Global error Toast for other errors
      Toast.show({
        icon: 'fail',
        content: errorMessage,
      });
    }
    
    return Promise.reject(error);
  }
);

export default request;
