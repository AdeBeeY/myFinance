const prisma = require("../config/prisma");
const AppError = require("../helpers/AppError");

const createTransaction = async ({
  userId,
  amount,
  type,
  description,
  transactionDate,
  categoryId,
  accountId,
}) => {

    // Verify the account belongs to the authenticated user
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });
  if (!account) {
    throw new AppError("Account not found.", 404);
  }

  // Verify the category belongs to the authenticated user
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });
    if (!category) {
      throw new AppError("Category not found.", 404);
    }
    if (category.type !== type) {
      throw new AppError(
        "Transaction type must match the selected category type.",
        400
      );
    }

  // Create the transaction
  const transaction = await prisma.transaction.create({
    data: {
      amount,
      type,
      description,
      transactionDate,
      userId,
      categoryId,
      accountId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      account: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return transaction;
};

const getTransactions = async (
  userId,
  filters = {}
) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
    },

    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },

      account: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      transactionDate: "desc",
    },
  });
 return transactions;
};

const getTransactionById = async (
  userId,
  transactionId
) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },

    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },

      account: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new AppError("Transaction not found.", 404);
  }

  return transaction;
};

const updateTransaction = async (
  userId,
  transactionId,
  data
) => {
  const existingTransaction =
  await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!existingTransaction) {
    throw new AppError("Transaction not found.", 404);
  }

  const accountId =
    data.accountId ?? existingTransaction.accountId;

  const categoryId =
    data.categoryId ?? existingTransaction.categoryId;

  const type =
    data.type ?? existingTransaction.type;

  // Verify the account belongs to the authenticated user
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });
  if (!account) {
    throw new AppError("Account not found.", 404);
  }

  // Verify the category belongs to the authenticated user
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });
  if (!category) {
    throw new AppError("Category not found.", 404);
  }
  if (category.type !== type) {
    throw new AppError(
      "Transaction type must match the selected category type.",
      400
    );
  }

  const transaction = await prisma.transaction.update({
    where: {
      id: transactionId,
    },

    data,

    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },

      account: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return transaction;
};

const deleteTransaction = async (
  userId,
  transactionId
) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!transaction) {
    throw new AppError("Transaction not found.", 404);
  }

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  return {
    message: "Transaction deleted successfully.",
  };
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};