const { validationResult } = require("express-validator");

const validationMiddleware = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  return res.status(400).json({
    success: false,
    message: "Validation failed.",
    errors,
  });
};

module.exports = validationMiddleware;