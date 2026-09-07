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