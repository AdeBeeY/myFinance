//  Core
const express = require("express");
const router = express.Router();

//  Middlewares
const authenticate = require("../middlewares/authMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");

//  Controllers
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

//  Validators
const {
  createTransactionValidator,
  updateTransactionValidator,
  transactionQueryValidator,
} = require("../validators/transactionValidator");

//  1. Collection Routes (GET /)
router.get(
  "/",
  authenticate,
  transactionQueryValidator,
  validationMiddleware,
  getTransactions
);

//  2. Mutation Routes
router.post(
  "/",
  authenticate,
  createTransactionValidator,
  validationMiddleware, // Added missing error handler
  createTransaction
);

//  3. Specific Item Parameterized Routes (/:id)
router.get(
  "/:id",
  authenticate,
  getTransactionById
);

router.put(
  "/:id",
  authenticate,
  updateTransactionValidator,
  validationMiddleware, // Added missing error handler
  updateTransaction
);

router.delete(
  "/:id",
  authenticate,
  deleteTransaction
);

module.exports = router;