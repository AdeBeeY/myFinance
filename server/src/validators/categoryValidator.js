const { body } = require("express-validator");

const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required.")
    .isString()
    .withMessage("Category name must be a string.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters."),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("Category type is required.")
    .isIn(["income", "expense"])
    .withMessage("Category type must be either 'income' or 'expense'."),
];

module.exports = {
  createCategoryValidator,
};