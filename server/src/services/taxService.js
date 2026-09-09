const prisma = require("../config/prisma");

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

module.exports = {
  getTaxSettings,
  upsertTaxSetting,
};