const prisma = require("../config/prisma");
const AppError = require("../helpers/AppError");

const createAccount = async ({
  userId,
  name,
  description,
}) => {
  // Check whether the account already exists
  const existingAccount = await prisma.account.findFirst({
    where: {
      userId,
      name,
    },
  });

  if (existingAccount) {
    throw new AppError("Account already exists.", 409);
  }

  // Create the account
  const account = await prisma.account.create({
    data: {
      userId,
      name,
      description,
    },
  });

  return account;
};

const getAccounts = async (userId) => {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return accounts;
};

const getAccountById = async (userId, accountId) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new AppError("Account not found.", 404);
  }

  return account;
};

const updateAccount = async (
  userId,
  accountId,
  {
    name,
    description,
  }
) => {
  // Check whether the account exists
  const existingAccount = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!existingAccount) {
    throw new AppError("Account not found.", 404);
  }

  // Check for duplicate account name
  const duplicateAccount = await prisma.account.findFirst({
    where: {
      userId,
      name,
      NOT: {
        id: accountId,
      },
    },
  });

  if (duplicateAccount) {
    throw new AppError("Account already exists.", 409);
  }

  // Update account
  const updatedAccount = await prisma.account.update({
    where: {
      id: accountId,
    },
    data: {
      name,
      description,
    },
  });

  return updatedAccount;
};

const deleteAccount = async (userId, accountId) => {
  // Check whether the account exists
  const existingAccount = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!existingAccount) {
    throw new AppError("Account not found.", 404);
  }

  // Delete the account
  await prisma.account.delete({
    where: {
      id: accountId,
    },
  });

  return null;
};

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};