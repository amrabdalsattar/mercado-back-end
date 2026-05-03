const { v4: uuidv4 } = require('uuid');

/**
 * Assigns a unique X-Request-ID to every incoming request for distributed tracing.
 */
const requestId = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

module.exports = requestId;
