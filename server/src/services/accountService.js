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
    include: {
      transactions: {
        select: {
          amount: true,
          type: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return accounts.map((account) => {
    let balance = 0;

    for (const transaction of account.transactions) {
      const amount = Number(transaction.amount);

      if (transaction.type === "INCOME") {
        balance += amount;
      } else if (transaction.type === "EXPENSE") {
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
  });
};

const getAccountById = async (userId, accountId) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    include: {
      transactions: {
        select: {
          amount: true,
          type: true,
        },
      },
    },
  });

  if (!account) {
    throw new AppError("Account not found.", 404);
  }

  let balance = 0;

  for (const transaction of account.transactions) {
    const amount = Number(transaction.amount);

    if (transaction.type === "INCOME") {
      balance += amount;
    } else if (transaction.type === "EXPENSE") {
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