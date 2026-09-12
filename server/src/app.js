const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { CLIENT_URL } = require("./config/env");

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

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/tax", taxRoutes);

app.use(errorHandler);

module.exports = app;