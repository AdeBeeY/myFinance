const express = require("express");

const router = express.Router();

const {
  register,
  login,
  profile,
  updateUserProfile,
  changeUserPassword,
} = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
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

router.put(
  "/profile",
  authenticate,
  updateProfileValidator,
  validationMiddleware,
  updateUserProfile
);

router.put(
  "/change-password",
  authenticate,
  changePasswordValidator,
  validationMiddleware,
  changeUserPassword
);

module.exports = router;