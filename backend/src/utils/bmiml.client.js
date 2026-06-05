const axios = require('axios');
const { BMI_ML_BASE_URL } = require('../config/env');

/**
 * Pre-configured Axios instance pointing at the BMI ML microservice.
 * All calls through this client will share the base URL and timeout.
 */
const bmimlClient = axios.create({
  baseURL: BMI_ML_BASE_URL,
  timeout: 90_000, // 90 s — BMI inference and LLM recommendations can be slow
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Log outbound BMI ML requests in development
bmimlClient.interceptors.request.use((config) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[BMI-ML] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// Surface BMI ML errors clearly in logs
bmimlClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status ?? 'NO_RESPONSE';
    const data = err.response?.data ?? err.message;
    console.error(`[BMI-ML] ← ${status}`, data);
    return Promise.reject(err);
  }
);

module.exports = bmimlClient;
