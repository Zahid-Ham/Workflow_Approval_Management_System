import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject Bearer JWT token dynamically
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Centralized error handling and session termination
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Catch 401 Unauthorized errors (session expiration)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('Authentication token expired or invalid. Evicting session...');
      
      // Token Refresh Preparation hook placeholder
      // In a full implementation, you can refresh tokens here:
      // const newToken = await authService.refreshToken();
      // axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
      // return axiosClient(originalRequest);
      
      localStorage.removeItem('token');
      // Force page reload or redirect to trigger AuthContext state update
      window.location.href = '/login';
    }

    // Format centralized error details
    const errorPayload = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'An unexpected server response occurred.',
      details: error.response?.data?.details || {},
    };

    console.error('API Error Response Intercepted:', errorPayload);
    return Promise.reject(errorPayload);
  }
);

export default axiosClient;
