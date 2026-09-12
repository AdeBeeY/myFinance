const dotenv = require("dotenv");

dotenv.config();

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(
      `${name} environment variable is required.`
    );
  }

  return value;
};

module.exports = {
  PORT: process.env.PORT || 5000,

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET: getRequiredEnv("JWT_SECRET"),

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN || "7d",

  CLIENT_URL:
    process.env.CLIENT_URL ||
    "http://localhost:5173",
};