const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET:
    process.env.JWT_SECRET ||
    "please_change_this_secret_in_production",

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN || "7d",
};