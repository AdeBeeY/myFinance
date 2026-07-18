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
    .isIn(["INCOME", "EXPENSE"])
    .withMessage("Category type must be either 'INCOME' or 'EXPENSE'."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description cannot exceed 255 characters."),
];

const updateCategoryValidator = createCategoryValidator;

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
};