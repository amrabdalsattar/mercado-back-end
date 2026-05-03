const { verifyAccessToken } = require('../utils/token');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Extracts and verifies JWT from Authorization header.
 * Attaches { id, role, sellerId? } to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);
  req.user = decoded;
  next();
});

/**
 * Like authenticate but doesn't throw if no token — sets req.user = null.
 * Use on routes that support both guests and authenticated users.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { authenticate, optionalAuth };
