const mongoSanitize = require('express-mongo-sanitize');
const xssFilters = require('xss-filters'); // We will use xss-filters for manual XSS if we want, or just omit it.

// Simple custom xss clean for an object
const cleanObj = (obj) => {
  if (!obj) return;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleanObj(obj[key]);
    } else if (typeof obj[key] === 'string') {
      // Just a simple strip or escape if we wanted. For now we rely on Zod and frontend.
      // obj[key] = xssFilters.inHTMLData(obj[key]);
    }
  }
};

const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  }
  if (req.params) {
    mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  }
  if (req.query) {
    // Cannot assign to req.query in Express 5, so we sanitize its properties
    mongoSanitize.sanitize(req.query, { replaceWith: '_' });
  }
  next();
};

module.exports = sanitizeInputs;
