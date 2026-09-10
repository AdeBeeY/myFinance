const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, "../.env.test"),
  override: true,
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Test DATABASE_URL is missing. Check server/.env.test."
  );
}

if (!databaseUrl.includes("myfinance_test")) {
  throw new Error(
    "Unsafe test database detected. Tests must use myfinance_test."
  );
}