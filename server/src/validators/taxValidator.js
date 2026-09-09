const {
  body,
  query,
} = require("express-validator");

const taxSettingValidator = [
  body("year")
    .notEmpty()
    .withMessage("Tax year is required")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Tax year must be between 2000 and 2100")
    .toInt(),

  body("taxRate")
    .notEmpty()
    .withMessage("Tax rate is required")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Tax rate must be between 0 and 100")
    .toFloat(),
];

const taxCalculationValidator = [
  body("year")
    .notEmpty()
    .withMessage("Tax year is required")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Tax year must be between 2000 and 2100")
    .toInt(),
];

const taxSummaryValidator = [
  query("year")
    .notEmpty()
    .withMessage("Tax year is required")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Tax year must be between 2000 and 2100")
    .toInt(),
];

module.exports = {
  taxSettingValidator,
  taxCalculationValidator,
  taxSummaryValidator,
};