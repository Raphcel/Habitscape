const { sendError } = require('../utils/response.helper');

/**
 * Zod validation middleware factory.
 * Usage: validate(myZodSchema) — place before the controller in route definitions.
 *
 * Validates req.body and replaces it with the parsed (type-safe) output.
 * Returns 400 with field-level error messages on failure.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Flatten Zod errors into a simple { field: message } map
    const errors = result.error.flatten().fieldErrors;
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body = result.data; // replace with parsed + coerced values
  next();
};

module.exports = { validate };
