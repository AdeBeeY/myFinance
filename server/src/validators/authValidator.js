const { body } = require("express-validator");

const registerValidator = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),

  body("lastName").trim().notEmpty().withMessage("Last name is required."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),

  body("currency")
    .optional()
    .isIn(["NGN", "USD", "GBP", "EUR"])
    .withMessage("Please select a valid currency."),
];

const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("password")
    .notEmpty()
    .withMessage("Password is required."),
];

module.exports = {
  registerValidator,
  loginValidator,
};