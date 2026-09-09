const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");

const {
  taxSettingValidator,
  taxCalculationValidator,
  taxSummaryValidator,
} = require("../validators/taxValidator");

const {
  getSettings,
  updateSettings,
  calculateTax,
  getSummary,
} = require("../controllers/taxController");

router.get(
  "/settings",
  authenticate,
  getSettings
);

router.put(
  "/settings",
  authenticate,
  taxSettingValidator,
  validationMiddleware,
  updateSettings
);

router.post(
  "/calculate",
  authenticate,
  taxCalculationValidator,
  validationMiddleware,
  calculateTax
);

router.get(
  "/summary",
  authenticate,
  taxSummaryValidator,
  validationMiddleware,
  getSummary
);

module.exports = router;