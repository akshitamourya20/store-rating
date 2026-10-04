import axios from 'axios';
import { handleClientFallback } from './clientMockFallback';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with automatic Vercel 405/404 failover
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response ? error.response.status : null;

    // If Vercel router returns 405 (Method Not Allowed), 404, or network error, seamlessly fulfill via client mock
    if (status === 405 || status === 404 || !error.response) {
      console.warn(`[API] Server returned ${status || 'Network Error'}, activating instant client failover.`);
      try {
        const fallbackRes = await handleClientFallback(error.config);
        if (fallbackRes.status >= 200 && fallbackRes.status < 300) {
          return fallbackRes;
        } else if (fallbackRes.status === 401) {
          return Promise.reject(new Error(fallbackRes.data.message || 'Invalid credentials.'));
        } else {
          return Promise.reject(new Error(fallbackRes.data.message || 'Request failed.'));
        }
      } catch (fallbackErr) {
        return Promise.reject(fallbackErr);
      }
    }

    // Handle session expiration
    if (status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
