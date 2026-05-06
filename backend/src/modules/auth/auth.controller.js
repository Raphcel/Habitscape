const authService = require('./auth.service');
const { sendSuccess, sendCreated, sendError } = require('../../utils/response.helper');

// POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    return sendCreated(res, { user, token }, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    return sendSuccess(res, { user, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/auth/me
const updateMe = async (req, res, next) => {
  try {
    const user = await authService.updateMe(req.user.id, req.body);
    return sendSuccess(res, { user }, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe };
