const app = require("./app");

const { PORT } = require("./config/env");

app.listen(PORT, () => {
  console.log(`🚀 MyFinance Server running on port ${PORT}`);
});