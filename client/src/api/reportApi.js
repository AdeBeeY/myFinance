import apiClient from "./apiClient";

export const getDashboardSummary = async () => {
  return apiClient("/reports/dashboard");
};