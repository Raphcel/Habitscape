import axios from 'axios';

/**
 * Axios instance for the Habitscape API.
 *
 * Dev:  requests go to /api/v1/... → Vite proxy → http://localhost:5000
 *       (no CORS headers needed because it's same-origin from the browser's perspective)
 * Prod: set VITE_API_URL=https://your-backend.com/api/v1 in your hosting env
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000, // fail fast — don't wait forever
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attach JWT token on every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Handle token expiry globally — but NOT for auth endpoints themselves.
// A failed login returns 401; we must NOT redirect away from /login in that case.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.startsWith('/auth/');
    const isUnauthorized = err.response?.status === 401;

    if (isUnauthorized && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
