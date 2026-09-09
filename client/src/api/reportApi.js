import apiClient from "./apiClient";

export const getDashboardSummary = async () => {
  return apiClient("/reports/dashboard");
};

export const getFinancialHealth = async () => {
  return apiClient("/reports/financial-health");
};

export const getExpenseBreakdown = async () => {
  return apiClient("/reports/expense-breakdown");
};

export const getMonthlyReport = async (
  year,
  month
) => {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  return apiClient(
    `/reports/monthly?${params.toString()}`
  );
};

export const getDateRangeReport = async (
  startDate,
  endDate
) => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  return apiClient(
    `/reports/date-range?${params.toString()}`
  );
};

export const getMonthlyTrends = async (year) => {
  const params = new URLSearchParams({
    year: String(year),
  });

  return apiClient(
    `/reports/monthly-trends?${params.toString()}`
  );
};

export const getCategorySpendingReport = async (
  year,
  month
) => {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  return apiClient(
    `/reports/categories?${params.toString()}`
  );
};

export const getCashFlowAnalysis = async (year) => {
  const params = new URLSearchParams({
    year: String(year),
  });

  return apiClient(
    `/reports/cash-flow?${params.toString()}`
  );
};

export const getMonthlySavingsTrend = async (
  year
) => {
  const params = new URLSearchParams({
    year: String(year),
  });

  return apiClient(
    `/reports/monthly-savings-trend?${params.toString()}`
  );
};

export const getTopSpendingCategories = async (
  limit = 5
) => {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  return apiClient(
    `/reports/top-spending-categories?${params.toString()}`
  );
};

export const getLargestTransactions = async (
  limit = 5
) => {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  return apiClient(
    `/reports/largest-transactions?${params.toString()}`
  );
};