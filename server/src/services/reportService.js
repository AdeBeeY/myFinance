const prisma = require("../config/prisma");

const getIncomeExpenseTotals = async (userId, extraWhere = {}) => {
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "INCOME",
        ...extraWhere,
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        ...extraWhere,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const income = Number(incomeResult._sum.amount ?? 0);
  const expense = Number(expenseResult._sum.amount ?? 0);

  return {
    income,
    expense,
  };
};

const getDashboardSummary = async (userId) => {
  const [
    { income: totalIncome, expense: totalExpense },
    totalAccounts,
    totalCategories,
    totalTransactions,
    recentTransactions,
  ] = await Promise.all([
    getIncomeExpenseTotals(userId),

    prisma.account.count({
      where: {
        userId,
      },
    }),

    prisma.category.count({
      where: {
        userId,
      },
    }),

    prisma.transaction.count({
      where: {
        userId,
      },
    }),

    prisma.transaction.findMany({
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
      take: 5,
    }),
  ]);

  const currentBalance = totalIncome - totalExpense;

  return {
    summary: {
      totalIncome,
      totalExpense,
      currentBalance,
      totalAccounts,
      totalCategories,
      totalTransactions,
    },
    recentTransactions,
  };
};

const getMonthlyReport = async (userId, year, month) => {
  const startDate = new Date(Number(year), Number(month) - 1, 1);
  const endDate = new Date(Number(year), Number(month), 1);

  const dateFilter = {
    transactionDate: {
      gte: startDate,
      lt: endDate,
    },
  };

  const [{ income, expense }, transactionCount] = await Promise.all([
    getIncomeExpenseTotals(userId, dateFilter),

    prisma.transaction.count({
      where: {
        userId,
        ...dateFilter,
      },
    }),
  ]);

  const balance = income - expense;

  return {
    year: Number(year),
    month: Number(month),
    income,
    expense,
    balance,
    transactionCount,
  };
};

const getCategorySpendingReport = async (
  userId,
  year,
  month
) => {
  const startDate = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  const endDate = new Date(
    Number(year),
    Number(month),
    1
  );

  const groupedTransactions =
  await prisma.transaction.groupBy({
    by: ["categoryId"],

    where: {
      userId,
      type: "EXPENSE",
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
    },

    _sum: {
      amount: true,
    },

    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  const categoryIds = groupedTransactions.map(
    (item) => item.categoryId
  );

  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryIds,
      },
      userId,
    },

    select: {
      id: true,
      name: true,
    },
  });

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ])
  );

  const report = groupedTransactions.map((item) => ({
    categoryId: item.categoryId,
    categoryName:
      categoryMap.get(item.categoryId) ??
      "Unknown Category",
    total: Number(item._sum.amount ?? 0),
  }));

  return report;
};

const getDateRangeReport = async (
  userId,
  startDate,
  endDate
) => {
  const start = new Date(startDate);

  const end = new Date(endDate);

  end.setDate(end.getDate() + 1);

  const { income, expense } =
  await getIncomeExpenseTotals(userId, {
    transactionDate: {
      gte: start,
      lt: end,
    },
  });

  const transactionCount =
  await prisma.transaction.count({
    where: {
      userId,
      transactionDate: {
        gte: start,
        lt: end,
      },
    },
  });

  const balance = income - expense;

  return {
    startDate,
    endDate,
    income,
    expense,
    balance,
    transactionCount,
  };
};

const getMonthlyTrends = async (
  userId,
  year
) => {
  const start = new Date(year, 0, 1);

  const end = new Date(Number(year) + 1, 0, 1);

  const transactions =
  await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: start,
        lt: end,
      },
    },

    select: {
      amount: true,
      type: true,
      transactionDate: true,
    },

    orderBy: {
      transactionDate: "asc",
    },
  });

  const monthlyTrends = Array.from(
    { length: 12 },
    (_, index) => ({
      month: index + 1,
      income: 0,
      expense: 0,
    })
  );

  transactions.forEach((transaction) => {
    const month =
      transaction.transactionDate.getMonth();

    if (transaction.type === "INCOME") {
      monthlyTrends[month].income += Number(
        transaction.amount
      );
    } else {
      monthlyTrends[month].expense += Number(
        transaction.amount
      );
    }
  });
  return monthlyTrends;
};

module.exports = {
  getIncomeExpenseTotals,
  getDashboardSummary,
  getMonthlyReport,
  getCategorySpendingReport,
  getDateRangeReport,
  getMonthlyTrends,
};