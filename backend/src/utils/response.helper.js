/**
 * Standardised API response helpers.
 * All responses share the same envelope so the frontend
 * can rely on a consistent shape.
 *
 * Success  → { success: true,  data: ..., message: ... }
 * Error    → { success: false, error: ..., message: ... }
 */

const sendSuccess = (res, data = null, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const sendCreated = (res, data = null, message = 'Created') => {
  return sendSuccess(res, data, message, 201);
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
  const body = { success: false, message };
  if (error && process.env.NODE_ENV !== 'production') body.error = error;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendCreated, sendError };
