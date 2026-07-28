const transactionService = require("../services/transactionService");
const apiResponse = require("../helpers/apiResponse");
const asyncHandler = require("../helpers/asyncHandler");

const createTransaction = asyncHandler(async (req, res) => {
  const transaction =
    await transactionService.createTransaction({
      userId: req.user.id,
      amount: req.body.amount,
      type: req.body.type,
      description: req.body.description,
      transactionDate: req.body.transactionDate,
      categoryId: req.body.categoryId,
      accountId: req.body.accountId,
    });

  return res.status(201).json(
    apiResponse(
      true,
      "Transaction created successfully.",
      transaction
    )
  );
});

const getTransactions = asyncHandler(async (req, res) => {
  const transactions =
    await transactionService.getTransactions(
      req.user.id,
      req.query
    );

  return res.status(200).json(
    apiResponse(
      true,
      'Transactions retrieved successfully.',
      transactions
    )
  );
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction =
    await transactionService.getTransactionById(
      req.user.id,
      req.params.id
    );

  return res.status(200).json(
    apiResponse(
      true,
      "Transaction retrieved successfully.",
      transaction
    )
  );
});

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction =
    await transactionService.updateTransaction(
      req.user.id,
      req.params.id,
      req.body
    );

  return res.status(200).json(
    apiResponse(
      true,
      "Transaction updated successfully.",
      transaction
    )
  );
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const result =
    await transactionService.deleteTransaction(
      req.user.id,
      req.params.id
    );

  return res.status(200).json(
    apiResponse(
      true,
      result.message,
      null
    )
  );
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};