const app = require("./app");
const prisma = require("./config/prisma");

const { PORT } = require("./config/env");

const server = app.listen(PORT, () => {
  console.log(
    `🚀 MyFinance Server running on port ${PORT}`
  );
});

const shutdown = (signal) => {
  console.log(
    `${signal} received. Shutting down gracefully...`
  );

  server.close(async () => {
    try {
      await prisma.$disconnect();

      console.log(
        "✅ Server shut down successfully."
      );

      process.exit(0);
    } catch (error) {
      console.error(
        "❌ Error during server shutdown:",
        error
      );

      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});
