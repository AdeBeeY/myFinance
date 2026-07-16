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

router.post("/register", registerValidator, register);

router.post("/login", loginValidator, login);

router.get("/profile", authenticate, profile);

module.exports = router;