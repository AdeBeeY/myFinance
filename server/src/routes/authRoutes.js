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
const authRateLimiter = require("../middlewares/authRateLimiter");

router.post(
  "/register",
  authRateLimiter,
  registerValidator,
  validationMiddleware,
  register
);

router.post(
  "/login",
  authRateLimiter,
  loginValidator,
  validationMiddleware,
  login
);

router.get("/profile", authenticate, profile);

module.exports = router;