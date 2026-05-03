const mongoSanitize = require('express-mongo-sanitize');
// xss-clean is deprecated but still functional; swap to xss or dompurify if needed
const xss = require('xss-clean');

/**
 * sanitizeInputs — array of middleware that:
 *  1. Strips keys starting with '$' or containing '.' (NoSQL injection)
 *  2. Escapes HTML characters in user input (XSS)
 */
const sanitizeInputs = (req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: '_' });
  xss()(req, res, next);
};

module.exports = sanitizeInputs;
