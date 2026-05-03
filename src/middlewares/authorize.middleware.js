const AppError = require('../utils/AppError');

/**
 * Role-based access control middleware.
 * Usage: authorize('admin', 'seller')
 */
const authorize = (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
    }
    next();
  };

module.exports = authorize;
