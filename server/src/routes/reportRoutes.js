const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const validationMiddleware = require(
  "../middlewares/validationMiddleware"
);
const {
  monthlyReportValidator,
  dateRangeReportValidator,
  yearlyReportValidator,
  topSpendingCategoriesValidator,
  largestTransactionsValidator,
} = require("../validators/reportValidator");

const {
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
} = require("../controllers/reportController");



router.get(
  "/dashboard",
  authenticate,
  getDashboardSummary
);

router.get(
  "/monthly",
  authenticate,
  monthlyReportValidator,
  validationMiddleware,
  getMonthlyReport
);

router.get(
  "/categories",
  authenticate,
  monthlyReportValidator,
  validationMiddleware,
  getCategorySpendingReport
);

router.get(
  "/date-range",
  authenticate,
  dateRangeReportValidator,
  validationMiddleware,
  getDateRangeReport
);

router.get(
  "/monthly-trends",
  authenticate,
  yearlyReportValidator,
  validationMiddleware,
  getMonthlyTrends
);

router.get(
  "/cash-flow",
  authenticate,
  yearlyReportValidator,
  validationMiddleware,
  getCashFlowAnalysis
);

router.get(
  "/expense-breakdown",
  authenticate,
  getExpenseBreakdownByCategory
);

router.get(
  "/top-spending-categories",
  authenticate,
  topSpendingCategoriesValidator,
  validationMiddleware,
  getTopSpendingCategories
);

router.get(
  "/largest-transactions",
  authenticate,
  largestTransactionsValidator,
  validationMiddleware,
  getLargestTransactions
);

router.get(
  "/income-expense-ratio",
  authenticate,
  getIncomeExpenseRatio
);

router.get(
  "/savings-rate",
  authenticate,
  getSavingsRate
);

router.get(
  "/monthly-savings-trend",
  authenticate,
  yearlyReportValidator,
  validationMiddleware,
  getMonthlySavingsTrend
);

router.get(
  "/financial-health",
  authenticate,
  getFinancialHealth
);

module.exports = router;