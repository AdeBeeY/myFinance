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
    totalIncome: income,
    totalExpense: expense,
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

const getCashFlowAnalysis = async (
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
  
  const cashFlow = Array.from(
    { length: 12 },
    (_, index) => ({
      month: index + 1,
      income: 0,
      expense: 0,
      netCashFlow: 0,
      runningBalance: 0,
    })
  );
  
  transactions.forEach((transaction) => {
    const month =
      transaction.transactionDate.getMonth();

    if (transaction.type === "INCOME") {
      cashFlow[month].income += Number(
        transaction.amount
      );
    } else {
      cashFlow[month].expense += Number(
        transaction.amount
      );
    }
  });

  let runningBalance = 0;

  cashFlow.forEach((monthData) => {
    monthData.netCashFlow =
      monthData.income - monthData.expense;

    runningBalance += monthData.netCashFlow;

    monthData.runningBalance = runningBalance;
  });
  return cashFlow;
};

const getExpenseBreakdownByCategory = async (userId) => {
  const expenseBreakdown =
  await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
    },
    _sum: {
      amount: true,
    },
  });

  const categoryIds = expenseBreakdown.map(
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

  const result = expenseBreakdown.map((item) => {
    const category = categories.find(
      (cat) => cat.id === item.categoryId
    );

    return {
      categoryId: item.categoryId,
      categoryName: category ? category.name : "Unknown",
      totalExpense: item._sum.amount
        ? item._sum.amount.toNumber()
        : 0,
    };
  });
  return result;
};

const getTopSpendingCategories = async (userId, limit = 5) => {
  const topCategories = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
    take: Number(limit),
  });

  const categoryIds = topCategories.map(
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

  const result = topCategories.map((item) => {
    const category = categories.find(
      (cat) => cat.id === item.categoryId
    );

    return {
      categoryId: item.categoryId,
      categoryName: category ? category.name : "Unknown",
      totalExpense: item._sum.amount
        ? item._sum.amount.toNumber()
        : 0,
    };
  });
  return result;
};

const getLargestTransactions = async (userId, limit = 5) => {
  const largestTransactions =
  await prisma.transaction.findMany({
    where: {
      userId,
    },

    orderBy: {
      amount: "desc",
    },

    take: Number(limit),

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

  const result = largestTransactions.map((transaction) => ({
    transactionId: transaction.id,
    amount: transaction.amount.toNumber(),
    type: transaction.type,
    description: transaction.description,
    transactionDate: transaction.transactionDate,

    category: {
      id: transaction.category.id,
      name: transaction.category.name,
      type: transaction.category.type,
    },

    account: {
      id: transaction.account.id,
      name: transaction.account.name,
    },
  }));
  return result;
};

const getIncomeExpenseRatio = async (userId) => {
  const {
    totalIncome,
    totalExpense,
  } = await getIncomeExpenseTotals(userId);

  const balance = totalIncome - totalExpense;

  const expenseRatio =
    totalIncome > 0
      ? (totalExpense / totalIncome) * 100
      : 0;

  const incomeExpenseRatio =
    totalExpense > 0
      ? totalIncome / totalExpense
      : 0;

  return {
    totalIncome,
    totalExpense,
    balance,
    expenseRatio: Number(expenseRatio.toFixed(2)),
    incomeExpenseRatio: Number(
      incomeExpenseRatio.toFixed(2)
    ),
  };
};

const getSavingsRate = async (userId) => {
  const {
    totalIncome,
    totalExpense,
  } = await getIncomeExpenseTotals(userId);

  const savings = totalIncome - totalExpense;

  const savingsRate =
    totalIncome > 0
      ? (savings / totalIncome) * 100
      : 0;

  return {
    totalIncome,
    totalExpense,
    savings,
    savingsRate: Number(
      savingsRate.toFixed(2)
    ),
  };
};

const getMonthlySavingsTrend = async (userId, year) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${Number(year) + 1}-01-01`),
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

  const monthlyData = Array.from(
    { length: 12 },
    (_, index) => ({
      month: index + 1,
      income: 0,
      expense: 0,
      savings: 0,
      savingsRate: 0,
    })
  );

  transactions.forEach((transaction) => {
  const month =
    new Date(transaction.transactionDate).getMonth();

    const index = month;

    const amount = transaction.amount.toNumber();

    if (transaction.type === "INCOME") {
      monthlyData[index].income += amount;
    }

    if (transaction.type === "EXPENSE") {
      monthlyData[index].expense += amount;
    }
  });

  monthlyData.forEach((month) => {
    month.savings = month.income - month.expense;

    month.savingsRate =
      month.income > 0
        ? Number(
            ((month.savings / month.income) * 100).toFixed(2)
          )
        : 0;
  });
  return monthlyData;
};

const getFinancialHealth = async (userId) => {
  const {
    totalIncome,
    totalExpense,
  } = await getIncomeExpenseTotals(userId);

  const balance = totalIncome - totalExpense;

  const expenseRatio =
    totalIncome > 0
      ? (totalExpense / totalIncome) * 100
      : 0;

  const savingsRate =
    totalIncome > 0
      ? (balance / totalIncome) * 100
      : 0;

  const incomeExpenseRatio =
    totalExpense > 0
      ? totalIncome / totalExpense
      : 0;

  return {
    totalIncome,
    totalExpense,
    balance,
    expenseRatio: Number(expenseRatio.toFixed(2)),
    savingsRate: Number(savingsRate.toFixed(2)),
    incomeExpenseRatio: Number(
      incomeExpenseRatio.toFixed(2)
    ),
  };
};

module.exports = {
  getIncomeExpenseTotals,
  getDashboardSummary,
  getMonthlyReport,
  getCategorySpendingReport,
  getDateRangeReport,
  getMonthlyTrends,
  getCashFlowAnalysis,
  getExpenseBreakdownByCategory,
  getTopSpendingCategories,
  getLargestTransactions,
  getIncomeExpenseRatio,
  getSavingsRate,
  getMonthlySavingsTrend,
  getFinancialHealth,
};