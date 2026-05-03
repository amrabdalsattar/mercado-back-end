const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Attach request ID to log context
  if (req.requestId) logger.error(`[${req.requestId}] ${err.message}`, { stack: err.stack });
  else logger.error(err.message, { stack: err.stack });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', 400, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`${field} already exists`, 409, 'DUPLICATE_KEY');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'MONGOOSE_VALIDATION',
      errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Something went wrong';
  const code = error.code || 'INTERNAL_ERROR';

  // In production, never expose stack traces for unexpected errors
  const body = { success: false, message, code, errors: [] };
  if (env.NODE_ENV === 'development' && !err.isOperational) {
    body.stack = err.stack;
  }

  return res.status(statusCode).json(body);
};

module.exports = errorHandler;
