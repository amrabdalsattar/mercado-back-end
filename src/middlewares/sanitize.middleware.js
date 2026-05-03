const mongoSanitize = require('express-mongo-sanitize');
const sanitizeHtml = require('sanitize-html');

/**
 * Recursively sanitizes string values in an object to prevent XSS.
 * This helper avoids re-assigning the root object, which is important
 * for Express 5's req.query and req.params getters.
 */
const cleanXSS = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (typeof value === 'object' && value !== null) {
      cleanXSS(value);
    } else if (typeof value === 'string') {
      obj[key] = sanitizeHtml(value, {
        allowedTags: [], // Strip all HTML tags
        allowedAttributes: {},
      });
    }
  });
};

const sanitizeInputs = (req, res, next) => {
  // 1. Prevent NoSQL Injection
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: '_' });

  // 2. Prevent XSS by stripping HTML from all string inputs
  if (req.body) cleanXSS(req.body);
  if (req.params) cleanXSS(req.params);
  if (req.query) cleanXSS(req.query);

  next();
};

module.exports = sanitizeInputs;
