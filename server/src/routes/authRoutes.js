const express = require("express");

const router = express.Router();

const { register } = require("../controllers/authController");
const { registerValidator } = require("../validators/authValidator");

router.post("/register", registerValidator, register);

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Authentication route is working.",
  });
});

module.exports = router;