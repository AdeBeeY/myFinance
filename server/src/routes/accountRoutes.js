const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");

const {
  createAccountValidator,
  updateAccountValidator,
} = require("../validators/accountValidator");

const {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} = require("../controllers/accountController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createAccountValidator,
  validationMiddleware,
  createAccount
);

router.get(
  "/",
  authMiddleware,
  getAccounts
);

router.get(
  "/:id",
  authMiddleware,
  getAccountById
);

router.put(
  "/:id",
  authMiddleware,
  updateAccountValidator,
  validationMiddleware,
  updateAccount
);

router.delete(
  "/:id",
  authMiddleware,
  deleteAccount
);

module.exports = router;