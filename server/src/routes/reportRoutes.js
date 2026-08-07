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
} = require("../validators/reportValidator");

const {
  getDashboardSummary,
  getMonthlyReport,
  getCategorySpendingReport,
  getDateRangeReport,
  getMonthlyTrends,
  getCashFlowAnalysis,
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

module.exports = router;