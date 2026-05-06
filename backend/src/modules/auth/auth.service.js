const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');
const { findByEmail, findById, createUser, updateUser } = require('./auth.query');

const SALT_ROUNDS = 12;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// ─── Business Logic ───────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Throws descriptive errors on conflict or validation issues.
 */
const register = async ({ name, email, password }) => {
  // 1. Conflict check
  const existing = await findByEmail(email);
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  // 2. Hash password
  const passwordHash = await hashPassword(password);

  // 3. Persist
  const user = await createUser({ name, email, passwordHash });

  // 4. Sign token
  const token = signToken({ id: user.id, email: user.email });

  return { user, token };
};

/**
 * Authenticate an existing user.
 * Uses a generic error message on failure to avoid user enumeration.
 */
const login = async ({ email, password }) => {
  // 1. Load user (including password_hash)
  const row = await findByEmail(email);

  // Generic message — do NOT reveal whether email exists
  const invalidErr = new Error('Invalid email or password');
  invalidErr.statusCode = 401;

  if (!row) throw invalidErr;

  // 2. Compare passwords
  const match = await comparePassword(password, row.password_hash);
  if (!match) throw invalidErr;

  // 3. Build safe user object (strip hash)
  const { password_hash, ...user } = row;

  // 4. Sign token
  const token = signToken({ id: user.id, email: user.email });

  return { user, token };
};

/**
 * Fetch the current user's profile.
 */
const getMe = async (userId) => {
  const user = await findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Partially update user profile fields.
 */
const updateMe = async (userId, fields) => {
  const user = await updateUser(userId, fields);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, getMe, updateMe };
