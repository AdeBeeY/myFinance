const { body } = require("express-validator");

const createAccountValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Account name is required.")
    .isString()
    .withMessage("Account name must be a string.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Account name must be between 2 and 50 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 191 })
    .withMessage("Description cannot exceed 191 characters."),
];

const updateAccountValidator = [
  body("name")
    .optional()
    .trim()
    .isString()
    .withMessage("Account name must be a string.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Account name must be between 2 and 50 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 191 })
    .withMessage("Description cannot exceed 191 characters."),
];

module.exports = {
  createAccountValidator,
  updateAccountValidator,
};