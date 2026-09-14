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

const NODE_ENV =
  process.env.NODE_ENV || "development";

const getClientUrl = () => {
  if (process.env.CLIENT_URL?.trim()) {
    return process.env.CLIENT_URL;
  }

  if (NODE_ENV === "production") {
    throw new Error(
      "CLIENT_URL environment variable is required in production."
    );
  }

  return "http://localhost:5173";
};

module.exports = {
  NODE_ENV,

  PORT: process.env.PORT || 5000,

  DATABASE_URL: getRequiredEnv("DATABASE_URL"),

  JWT_SECRET: getRequiredEnv("JWT_SECRET"),

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN || "7d",

  CLIENT_URL: getClientUrl(),
};