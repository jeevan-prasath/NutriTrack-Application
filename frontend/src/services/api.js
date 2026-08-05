import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // Increased from 15s to 30s for Render cold starts
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - only logout on REAL 401s (not network timeouts)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout if server explicitly returned 401 (invalid token)
    // NOT on network errors, timeouts, or server errors (5xx)
    if (error.response?.status === 401) {
      // Don't logout if this was the /auth/me or /auth/login request itself
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('nt_token');
        localStorage.removeItem('nt_user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
