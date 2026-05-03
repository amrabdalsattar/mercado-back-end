const mongoSanitize = require('express-mongo-sanitize');
// xss-clean is deprecated but still functional; swap to xss or dompurify if needed
const xss = require('xss-clean');

/**
 * sanitizeInputs — array of middleware that:
 *  1. Strips keys starting with '$' or containing '.' (NoSQL injection)
 *  2. Escapes HTML characters in user input (XSS)
 */
const sanitizeInputs = [mongoSanitize(), xss()];

module.exports = sanitizeInputs;
