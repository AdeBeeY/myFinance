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
  // Destructure filters
  const {
    type,
    accountId,
    categoryId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    sort,
    page = 1,
    limit = 10,
  } = filters;

  // Step 2: Initialize the where clause object with required userId
  const where = {
    userId,
  };

  let orderBy = {
    transactionDate: "desc",
  };

  const currentPage = Number(page);

  const pageSize = Number(limit);

  const skip = (currentPage - 1) * pageSize;

  switch (sort) {
    case "date_asc":
      orderBy = {
        transactionDate: "asc",
      };
      break;

    case "amount_desc":
      orderBy = {
        amount: "desc",
      };
      break;

    case "amount_asc":
      orderBy = {
        amount: "asc",
      };
      break;

    case "date_desc":
    default:
      orderBy = {
        transactionDate: "desc",
      };
  }

  if (type) {
    where.type = type;
  }

  if (accountId) {
    where.accountId = accountId;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  if (startDate || endDate) {
    where.transactionDate = {};

    if (startDate) {
      where.transactionDate.gte = new Date(startDate);
    }

    if (endDate) {
      where.transactionDate.lte = new Date(endDate);
    }
  }

  if (minAmount || maxAmount) {
    where.amount = {};

    if (minAmount) {
      where.amount.gte = Number(minAmount);
    }

    if (maxAmount) {
      where.amount.lte = Number(maxAmount);
    }
  }

  if (search) {
    where.OR = [
      {
        description: {
          contains: search,
        },
      },

      {
        account: {
          name: {
            contains: search,
          },
        },
      },

      {
        category: {
          name: {
            contains: search,
          },
        },
      },
    ];
  }

  const totalTransactions =
  await prisma.transaction.count({
    where,
  });

  const totalPages = Math.ceil(
    totalTransactions / pageSize
  );

  const transactions = await prisma.transaction.findMany({
    where,

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

    orderBy,
    skip,
    take: pageSize,
  });
 return {
    transactions,

    pagination: {
      page: currentPage,
      limit: pageSize,
      total: totalTransactions,
      totalPages,
    },
  };
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