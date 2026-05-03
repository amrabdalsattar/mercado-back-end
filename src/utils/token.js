const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('./AppError');

/**
 * Signs an access token (short-lived).
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

/**
 * Signs a refresh token (long-lived).
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

/**
 * Verifies an access token. Throws AppError on failure.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
};

/**
 * Verifies a refresh token. Throws AppError on failure.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
};

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
