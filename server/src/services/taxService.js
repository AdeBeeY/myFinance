const prisma = require("../config/prisma");
const {
  getIncomeExpenseTotals,
} = require("./reportService");

const getTaxSettings = async (userId) => {
  const taxSettings = await prisma.taxSetting.findMany({
    where: {
      userId,
    },
    orderBy: {
      year: "desc",
    },
  });

  return taxSettings.map((setting) => ({
    ...setting,
    taxRate: Number(setting.taxRate),
  }));
};

const upsertTaxSetting = async (
  userId,
  year,
  taxRate
) => {
  const setting = await prisma.taxSetting.upsert({
    where: {
      userId_year: {
        userId,
        year,
      },
    },

    update: {
      taxRate,
    },

    create: {
      userId,
      year,
      taxRate,
    },
  });

  return {
    ...setting,
    taxRate: Number(setting.taxRate),
  };
};

const calculateEstimatedTax = ({
  totalIncome,
  totalExpense,
  taxRate,
}) => {
  const income = Number(totalIncome);
  const expense = Number(totalExpense);
  const rate = Number(taxRate);

  const taxableIncome = Math.max(
    income - expense,
    0
  );

  const estimatedTax =
    taxableIncome * (rate / 100);

  return {
    totalIncome: income,
    totalExpense: expense,
    taxableIncome,
    taxRate: rate,
    estimatedTax,
  };
};

const calculateTaxForYear = async (
  userId,
  year,
  taxRate
) => {
  const numericYear = Number(year);

  const startDate = new Date(
    numericYear,
    0,
    1
  );

  const endDate = new Date(
    numericYear + 1,
    0,
    1
  );

  const {
    totalIncome,
    totalExpense,
  } = await getIncomeExpenseTotals(
    userId,
    {
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
    }
  );

  return {
    year: numericYear,
    ...calculateEstimatedTax({
      totalIncome,
      totalExpense,
      taxRate,
    }),
  };
};

const getTaxSettingForYear = async (
  userId,
  year
) => {
  const numericYear = Number(year);

  const setting =
    await prisma.taxSetting.findUnique({
      where: {
        userId_year: {
          userId,
          year: numericYear,
        },
      },
    });

  if (!setting) {
    return null;
  }

  return {
    ...setting,
    taxRate: Number(setting.taxRate),
  };
};

const calculateUserTaxForYear = async (
  userId,
  year
) => {
  const taxSetting =
    await getTaxSettingForYear(
      userId,
      year
    );

  if (!taxSetting) {
    return null;
  }

  return calculateTaxForYear(
    userId,
    year,
    taxSetting.taxRate
  );
};

const getTaxSummary = async (
  userId,
  year
) => {
  return calculateUserTaxForYear(
    userId,
    year
  );
};


module.exports = {
  getTaxSettings,
  upsertTaxSetting,
  calculateEstimatedTax,
  calculateTaxForYear,
  getTaxSettingForYear,
  calculateUserTaxForYear,
  getTaxSummary,
};