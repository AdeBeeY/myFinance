const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");

const {
  taxSettingValidator,
} = require("../validators/taxValidator");

const {
  getSettings,
  updateSettings,
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

module.exports = router;