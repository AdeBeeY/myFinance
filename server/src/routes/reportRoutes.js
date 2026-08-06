const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const validationMiddleware = require(
  "../middlewares/validationMiddleware"
);
const {
  monthlyReportValidator,
} = require("../validators/reportValidator");

const {
  getDashboardSummary,
  getMonthlyReport,
  getCategorySpendingReport,
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

module.exports = router;