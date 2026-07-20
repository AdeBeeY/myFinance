const accountService = require("../services/accountService");
const apiResponse = require("../helpers/apiResponse");
const asyncHandler = require("../helpers/asyncHandler");

const createAccount = asyncHandler(async (req, res) => {
  const account = await accountService.createAccount({
    userId: req.user.id,
    name: req.body.name,
    description: req.body.description,
  });

  return res.status(201).json(
    apiResponse(
      true,
      "Account created successfully.",
      account
    )
  );
});

const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await accountService.getAccounts(req.user.id);

  return res.status(200).json(
    apiResponse(
      true,
      "Accounts retrieved successfully.",
      accounts
    )
  );
});

const getAccountById = asyncHandler(async (req, res) => {
  const account = await accountService.getAccountById(
    req.user.id,
    req.params.id
  );

  return res.status(200).json(
    apiResponse(
      true,
      "Account retrieved successfully.",
      account
    )
  );
});

const updateAccount = asyncHandler(async (req, res) => {
  const account = await accountService.updateAccount(
    req.user.id,
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
    }
  );

  return res.status(200).json(
    apiResponse(
      true,
      "Account updated successfully.",
      account
    )
  );
});

const deleteAccount = asyncHandler(async (req, res) => {
  await accountService.deleteAccount(req.user.id, req.params.id);

  return res.status(200).json(
    apiResponse(
      true,
      "Account deleted successfully.",
      null
    )
  );
});

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};