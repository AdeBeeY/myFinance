const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");

const {
  taxSettingValidator,
  taxCalculationValidator,
} = require("../validators/taxValidator");

const {
  getSettings,
  updateSettings,
  calculateTax,
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

module.exports = router;