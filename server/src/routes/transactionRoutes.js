const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authMiddleware");

const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const {
  createTransactionValidator,
  updateTransactionValidator,
} = require("../validators/transactionValidator");

router.post(
  "/",
  authenticate,
  createTransactionValidator,
  createTransaction
);

router.get(
  "/",
  authenticate,
  getTransactions
);

router.get(
  "/:id",
  authenticate,
  getTransactionById
);

router.put(
  "/:id",
  authenticate,
  updateTransactionValidator,
  updateTransaction
);

router.delete(
  "/:id",
  authenticate,
  deleteTransaction
);

module.exports = router;