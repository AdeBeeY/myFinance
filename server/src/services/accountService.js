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

  return {
    ...account,
    balance: 0,
  };
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

  if (accounts.length === 0) {
    return [];
  }

  const accountIds = accounts.map(
    (account) => account.id
  );

  const totals = await prisma.transaction.groupBy({
    by: ["accountId", "type"],
    where: {
      userId,
      accountId: {
        in: accountIds,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const balances = new Map();

  for (const total of totals) {
    const currentBalance =
      balances.get(total.accountId) || 0;

    const amount = Number(
      total._sum.amount || 0
    );

    const balance =
      total.type === "INCOME"
        ? currentBalance + amount
        : currentBalance - amount;

    balances.set(total.accountId, balance);
  }

  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    description: account.description,
    balance: balances.get(account.id) || 0,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  }));
};

const getAccountById = async (
  userId,
  accountId
) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new AppError(
      "Account not found.",
      404
    );
  }

  const totals =
    await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

  let balance = 0;

  for (const total of totals) {
    const amount = Number(
      total._sum.amount || 0
    );

    if (total.type === "INCOME") {
      balance += amount;
    } else if (total.type === "EXPENSE") {
      balance -= amount;
    }
  }

  return {
    id: account.id,
    name: account.name,
    description: account.description,
    balance,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
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

  return getAccountById(userId, accountId);
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

  // Check whether the account has transactions
  const transactionCount = await prisma.transaction.count({
    where: {
      accountId,
      userId,
    },
  });

  if (transactionCount > 0) {
    throw new AppError(
      "Account cannot be deleted because it has transactions.",
      409
    );
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