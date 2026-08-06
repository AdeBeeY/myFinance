const { query } = require("express-validator");

const monthlyReportValidator = [
  query("year")
    .notEmpty()
    .withMessage("Year is required.")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be between 2000 and 2100."),

  query("month")
    .notEmpty()
    .withMessage("Month is required.")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12."),
];

module.exports = {
  monthlyReportValidator,
};