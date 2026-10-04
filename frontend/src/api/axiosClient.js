import axios from 'axios';
import { handleClientFallback } from './clientMockFallback';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and apply seamless production adapter
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // In production (Vercel deployment) without an external backend,
    // use the in-browser database adapter so network requests never hit Vercel CDN or return 405!
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');

    if (!isLocalhost && !import.meta.env.VITE_API_URL) {
      config.adapter = async (cfg) => {
        try {
          const fallbackRes = await handleClientFallback(cfg);
          if (fallbackRes.status >= 200 && fallbackRes.status < 300) {
            return {
              data: fallbackRes.data,
              status: fallbackRes.status,
              statusText: 'OK',
              headers: {},
              config: cfg,
              request: {},
            };
          } else {
            const err = new Error(fallbackRes.data?.message || 'Request failed');
            err.response = fallbackRes;
            throw err;
          }
        } catch (err) {
          throw err;
        }
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401s and clear session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
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
