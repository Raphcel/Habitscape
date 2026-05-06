/**
 * Validated environment variables.
 * The app will crash at startup if a required variable is missing —
 * far better than silent failures deep in a request cycle.
 */

function requireEnv(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key, defaultValue = '') {
  return process.env[key] ?? defaultValue;
}

module.exports = {
  // Server
  PORT: optionalEnv('PORT', '5000'),
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),

  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // JWT
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '24h'),

  // ML Service
  FASTAPI_BASE_URL: optionalEnv('FASTAPI_BASE_URL', 'http://localhost:8000'),

  // Frontend origin for CORS
  CLIENT_ORIGIN: optionalEnv('CLIENT_ORIGIN', 'http://localhost:5173'),

  // Google Gemini
  GEMINI_API_KEY: optionalEnv('GEMINI_API_KEY', ''),

  // File storage
  UPLOAD_DIR: optionalEnv('UPLOAD_DIR', 'uploads'),
};
