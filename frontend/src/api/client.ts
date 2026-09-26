import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('linksnip_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking public routes or optional auth
      //login page and redirect page does not require authentication
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/r/')) {
        // clear expired token
        localStorage.removeItem('linksnip_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
