const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to MyFinance API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

app.use(errorHandler);

module.exports = app;