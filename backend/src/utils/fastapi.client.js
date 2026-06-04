const axios = require('axios');
const { FASTAPI_BASE_URL } = require('../config/env');

/**
 * Pre-configured Axios instance pointing at the FastAPI ML microservice.
 * All calls through this client will share the base URL and timeout.
 */
const fastapiClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 60_000, // 60 s — Railway cold starts can be slow
  headers: {
    Accept: 'application/json',
  },
});

// Log outbound ML requests in development
fastapiClient.interceptors.request.use((config) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ML] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// Surface ML errors clearly in logs
fastapiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status ?? 'NO_RESPONSE';
    const data = err.response?.data ?? err.message;
    console.error(`[ML] ← ${status}`, data);
    return Promise.reject(err);
  }
);

module.exports = fastapiClient;
