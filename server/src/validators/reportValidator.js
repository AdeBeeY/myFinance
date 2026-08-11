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
    .toInt()
    .withMessage("Month must be between 1 and 12."),
];

const dateRangeReportValidator = [
  query("startDate")
    .notEmpty()
    .withMessage("Start date is required.")
    .isISO8601()
    .withMessage("Start date must be a valid date (YYYY-MM-DD)."),

  query("endDate")
  .notEmpty()
  .withMessage("End date is required.")
  .isISO8601()
  .withMessage("End date must be a valid date (YYYY-MM-DD).")
  .custom((endDate, { req }) => {
    const startDate = new Date(req.query.startDate);
    const end = new Date(endDate);

    if (startDate > end) {
      throw new Error(
        "End date must be on or after the start date."
      );
    }

    return true;
  }),
];

const yearlyReportValidator = [
  query("year")
    .notEmpty()
    .withMessage("Year is required.")
    .isInt({ min: 2000, max: 2100 })
    .toInt()
    .withMessage(
      "Year must be between 2000 and 2100."
    ),
];

const reportLimitValidator = query("limit")
  .optional()
  .isInt({ min: 1, max: 100 })
  .toInt()
  .withMessage("Limit must be an integer between 1 and 100.");

  const topSpendingCategoriesValidator = [
  reportLimitValidator,
  ];

  const largestTransactionsValidator = [
    reportLimitValidator,
  ];

module.exports = {
  monthlyReportValidator,
  dateRangeReportValidator,
  yearlyReportValidator,
  topSpendingCategoriesValidator,
  largestTransactionsValidator,
};