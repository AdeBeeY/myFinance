const { body } = require("express-validator");

const createTransactionValidator = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required.")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid decimal number with up to 2 decimal places.")
    .custom((value) => {
      if (Number(value) <= 0) {
        throw new Error("Amount must be greater than zero.");
      }

      return true;
    }),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("Transaction type is required.")
    .isIn(["INCOME", "EXPENSE"])
    .withMessage(
      "Transaction type must be either 'INCOME' or 'EXPENSE'."
    ),

  body("transactionDate")
    .notEmpty()
    .withMessage("Transaction date is required.")
    .isISO8601()
    .withMessage("Transaction date must be a valid date.")
    .toDate(),

  body("categoryId")
    .trim()
    .notEmpty()
    .withMessage("Category is required.")
    .isUUID()
    .withMessage("Category ID must be a valid UUID."),

  body("accountId")
    .trim()
    .notEmpty()
    .withMessage("Account is required.")
    .isUUID()
    .withMessage("Account ID must be a valid UUID."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 191 })
    .withMessage("Description cannot exceed 191 characters."),
];

const updateTransactionValidator = [
  body("amount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid decimal number with up to 2 decimal places.")
    .custom((value) => {
      if (value !== undefined && Number(value) <= 0) {
        throw new Error("Amount must be greater than zero.");
      }

      return true;
    }),

  body("type")
    .optional()
    .trim()
    .isIn(["INCOME", "EXPENSE"])
    .withMessage(
      "Transaction type must be either 'INCOME' or 'EXPENSE'."
    ),

  body("transactionDate")
    .optional()
    .isISO8601()
    .withMessage("Transaction date must be a valid date.")
    .toDate(),

  body("categoryId")
    .optional()
    .trim()
    .isUUID()
    .withMessage("Category ID must be a valid UUID."),

  body("accountId")
    .optional()
    .trim()
    .isUUID()
    .withMessage("Account ID must be a valid UUID."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 191 })
    .withMessage("Description cannot exceed 191 characters."),
];

module.exports = {
  createTransactionValidator,
  updateTransactionValidator,
};