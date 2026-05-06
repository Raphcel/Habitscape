/**
 * Global error handler.
 * Must be the LAST middleware registered in app.js (4 parameters).
 *
 * Handles:
 *  - Errors thrown with a custom statusCode property (from service layer)
 *  - Zod parse errors (should be caught by validate middleware, but just in case)
 *  - Generic unexpected errors (500)
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log everything in dev; only log 5xx in prod
  if (isDev || (err.statusCode ?? 500) >= 500) {
    console.error(`[ERROR] ${req.method} ${req.url}`, err);
  }

  const statusCode = err.statusCode ?? 500;
  const message = statusCode < 500 ? err.message : 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

module.exports = { errorHandler };
