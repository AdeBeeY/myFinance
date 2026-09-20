const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { CLIENT_URL } = require("./config/env");
const prisma = require("./config/prisma");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const errorHandler = require("./middlewares/errorHandler");
const taxRoutes = require("./routes/taxRoutes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: CLIENT_URL,
  })
);

app.use(
  express.json({
    limit: "100kb",
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to MyFinance API",
  });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/tax", taxRoutes);

app.use(errorHandler);

module.exports = app;