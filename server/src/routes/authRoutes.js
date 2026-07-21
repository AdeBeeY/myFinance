const express = require("express");

const router = express.Router();

const {
  register,
  login,
  profile,
} = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const authenticate = require("../middlewares/authMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");

router.post(
  "/register",
  registerValidator,
  validationMiddleware,
  register
);

router.post(
  "/login",
  loginValidator,
  validationMiddleware,
  login
);

router.get("/profile", authenticate, profile);

module.exports = router;