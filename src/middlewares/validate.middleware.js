const AppError = require('../utils/AppError');

/**
 * Factory: returns an Express middleware that validates req against a Zod schema.
 * The schema should have optional keys: body, params, query.
 *
 * Usage:
 *   router.post('/', validate(createProductSchema), controller.create);
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const message = Object.values(errors).flat()[0] || 'Validation failed';
    return next(new AppError(message, 422, 'VALIDATION_ERROR'));
  }

  // Attach parsed (coerced) data back to req
  req.body = result.data.body ?? req.body;
  req.params = result.data.params ?? req.params;
  req.query = result.data.query ?? req.query;

  next();
};

module.exports = validate;
