const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * General API rate limiter — 100 req per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.', code: 'RATE_LIMITED' },
});

/**
 * Stricter limiter for auth routes — 10 req per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.', code: 'AUTH_RATE_LIMITED' },
});

module.exports = { apiLimiter, authLimiter };
