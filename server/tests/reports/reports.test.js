const request = require("supertest");

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");

const TEST_EMAIL =
  "integration-reports@myfinance.test";

const SECOND_TEST_EMAIL =
  "integration-reports-second@myfinance.test";

const TEST_PASSWORD = "Password123";

let token;
let userId;
let accountId;
let incomeCategoryId;
let expenseCategoryId;

const cleanupTestUser = async () => {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          TEST_EMAIL,
          SECOND_TEST_EMAIL,
        ],
      },
    },
    select: {
      id: true,
    },
  });

  const userIds = users.map((user) => user.id);

  if (userIds.length === 0) {
    return;
  }

  await prisma.transaction.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.category.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.account.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.taxSetting.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
};

const createTestFixtures = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Report",
      lastName: "Tester",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      currency: "NGN",
    });

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

  token = loginResponse.body.token;
  userId = loginResponse.body.user.id;

  const accountResponse = await request(app)
    .post("/api/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Report Bank",
      description: "Reports integration test account",
    });

  accountId = accountResponse.body.data.id;

  const incomeCategoryResponse = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Salary",
      type: "INCOME",
    });

  incomeCategoryId =
    incomeCategoryResponse.body.data.id;

  const expenseCategoryResponse = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Food",
      type: "EXPENSE",
    });

  expenseCategoryId =
    expenseCategoryResponse.body.data.id;
};

const createTransaction = async ({
  amount,
  type,
  description,
  transactionDate,
  categoryId,
}) => {
  const response = await request(app)
    .post("/api/transactions")
    .set("Authorization", `Bearer ${token}`)
    .send({
      amount,
      type,
      description,
      transactionDate,
      categoryId,
      accountId,
    });

  expect(response.status).toBe(201);

  return response.body.data;
};

const createReportTransactions = async () => {
  await createTransaction({
    amount: 300000,
    type: "INCOME",
    description: "January salary",
    transactionDate: "2026-01-10",
    categoryId: incomeCategoryId,
  });

  await createTransaction({
    amount: 50000,
    type: "EXPENSE",
    description: "January food",
    transactionDate: "2026-01-15",
    categoryId: expenseCategoryId,
  });

  await createTransaction({
    amount: 200000,
    type: "INCOME",
    description: "February salary",
    transactionDate: "2026-02-10",
    categoryId: incomeCategoryId,
  });

  await createTransaction({
    amount: 80000,
    type: "EXPENSE",
    description: "February food",
    transactionDate: "2026-02-20",
    categoryId: expenseCategoryId,
  });
};

const createSecondUserWithTransactions = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Second",
      lastName: "Report Tester",
      email: SECOND_TEST_EMAIL,
      password: TEST_PASSWORD,
      currency: "NGN",
    });

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: SECOND_TEST_EMAIL,
      password: TEST_PASSWORD,
    });

  const secondToken = loginResponse.body.token;

  const accountResponse = await request(app)
    .post("/api/accounts")
    .set(
      "Authorization",
      `Bearer ${secondToken}`
    )
    .send({
      name: "Second User Bank",
    });

  const categoryResponse = await request(app)
    .post("/api/categories")
    .set(
      "Authorization",
      `Bearer ${secondToken}`
    )
    .send({
      name: "Second Salary",
      type: "INCOME",
    });

  const transactionResponse = await request(app)
    .post("/api/transactions")
    .set(
      "Authorization",
      `Bearer ${secondToken}`
    )
    .send({
      amount: 900000,
      type: "INCOME",
      description: "Second user income",
      transactionDate: "2026-01-20",
      categoryId: categoryResponse.body.data.id,
      accountId: accountResponse.body.data.id,
    });

  expect(transactionResponse.status).toBe(201);
};

describe("Reports API", () => {
  beforeEach(async () => {
    await cleanupTestUser();
    await createTestFixtures();
  });

  afterAll(async () => {
    await cleanupTestUser();
    await prisma.$disconnect();
  });

  test("rejects report access without authentication", async () => {
    const response = await request(app)
      .get("/api/reports/dashboard");

    expect(response.status).toBe(401);
  });

  test("retrieves the dashboard financial summary", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.summary).toEqual({
      totalIncome: 500000,
      totalExpense: 130000,
      currentBalance: 370000,
      totalAccounts: 1,
      totalCategories: 2,
      totalTransactions: 4,
    });

    expect(response.body.data.recentTransactions)
      .toHaveLength(4);

    const descriptions =
      response.body.data.recentTransactions.map(
        (transaction) =>
          transaction.description
      );

    expect(descriptions).toEqual([
      "February food",
      "February salary",
      "January food",
      "January salary",
    ]);
  });

  test("retrieves the monthly financial report", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/monthly?year=2026&month=1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      year: 2026,
      month: 1,
      income: 300000,
      expense: 50000,
      balance: 250000,
      transactionCount: 2,
    });
  });

  test("retrieves a financial report for an inclusive date range", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get(
        "/api/reports/date-range?startDate=2026-01-15&endDate=2026-02-10"
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      startDate: "2026-01-15",
      endDate: "2026-02-10",
      income: 200000,
      expense: 50000,
      balance: 150000,
      transactionCount: 2,
    });
  });

  test("retrieves category spending for a selected month", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/categories?year=2026&month=1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0]).toEqual({
      categoryId: expenseCategoryId,
      categoryName: "Food",
      total: 50000,
    });
  });

  test("retrieves monthly income and expense trends for a year", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/monthly-trends?year=2026")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(12);

    expect(response.body.data[0]).toEqual({
      month: 1,
      income: 300000,
      expense: 50000,
    });

    expect(response.body.data[1]).toEqual({
      month: 2,
      income: 200000,
      expense: 80000,
    });

    expect(response.body.data[2]).toEqual({
      month: 3,
      income: 0,
      expense: 0,
    });
  });

  test("retrieves yearly cash flow analysis", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/cash-flow?year=2026")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(12);

    expect(response.body.data[0]).toEqual({
      month: 1,
      income: 300000,
      expense: 50000,
      netCashFlow: 250000,
      runningBalance: 250000,
    });

    expect(response.body.data[1]).toEqual({
      month: 2,
      income: 200000,
      expense: 80000,
      netCashFlow: 120000,
      runningBalance: 370000,
    });

    expect(response.body.data[2]).toEqual({
      month: 3,
      income: 0,
      expense: 0,
      netCashFlow: 0,
      runningBalance: 370000,
    });
  });

  test("retrieves expense breakdown by category", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/expense-breakdown")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0]).toEqual({
      categoryId: expenseCategoryId,
      categoryName: "Food",
      totalExpense: 130000,
    });
  });

  test("retrieves top spending categories", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/top-spending-categories?limit=1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0]).toEqual({
      categoryId: expenseCategoryId,
      categoryName: "Food",
      totalExpense: 130000,
    });
  });

  test("retrieves largest transactions in descending amount order", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/largest-transactions?limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(2);

    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        amount: 300000,
        type: "INCOME",
        description: "January salary",
      })
    );

    expect(response.body.data[1]).toEqual(
      expect.objectContaining({
        amount: 200000,
        type: "INCOME",
        description: "February salary",
      })
    );

    expect(response.body.data[0].category).toEqual({
      id: incomeCategoryId,
      name: "Salary",
      type: "INCOME",
    });

    expect(response.body.data[0].account).toEqual({
      id: accountId,
      name: "Report Bank",
    });
  });

  test("retrieves income and expense ratios", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/income-expense-ratio")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      totalIncome: 500000,
      totalExpense: 130000,
      balance: 370000,
      expenseRatio: 26,
      incomeExpenseRatio: 3.85,
    });
  });

  test("retrieves savings rate", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/savings-rate")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      totalIncome: 500000,
      totalExpense: 130000,
      savings: 370000,
      savingsRate: 74,
    });
  });

  test("retrieves monthly savings trend for a year", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/monthly-savings-trend?year=2026")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(12);

    expect(response.body.data[0]).toEqual({
      month: 1,
      income: 300000,
      expense: 50000,
      savings: 250000,
      savingsRate: 83.33,
    });

    expect(response.body.data[1]).toEqual({
      month: 2,
      income: 200000,
      expense: 80000,
      savings: 120000,
      savingsRate: 60,
    });

    expect(response.body.data[2]).toEqual({
      month: 3,
      income: 0,
      expense: 0,
      savings: 0,
      savingsRate: 0,
    });
  });

  test("retrieves financial health summary", async () => {
    await createReportTransactions();

    const response = await request(app)
      .get("/api/reports/financial-health")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      totalIncome: 500000,
      totalExpense: 130000,
      balance: 370000,
      expenseRatio: 26,
      savingsRate: 74,
      incomeExpenseRatio: 3.85,
    });
  });

  test("rejects invalid monthly report query parameters", async () => {
    const response = await request(app)
      .get("/api/reports/monthly?year=2026&month=13")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("rejects invalid date range query parameters", async () => {
    const response = await request(app)
      .get(
        "/api/reports/date-range?startDate=2026-02-10&endDate=2026-01-10"
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("rejects an invalid yearly report year", async () => {
    const response = await request(app)
      .get("/api/reports/monthly-trends?year=1999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("rejects an invalid report limit", async () => {
    const response = await request(app)
      .get(
        "/api/reports/top-spending-categories?limit=101"
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("reports include only the authenticated user's financial data", async () => {
    await createReportTransactions();
    await createSecondUserWithTransactions();

    const response = await request(app)
      .get("/api/reports/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.summary).toEqual({
      totalIncome: 500000,
      totalExpense: 130000,
      currentBalance: 370000,
      totalAccounts: 1,
      totalCategories: 2,
      totalTransactions: 4,
    });

    const descriptions =
      response.body.data.recentTransactions.map(
        (transaction) =>
          transaction.description
      );

    expect(descriptions).not.toContain(
      "Second user income"
    );
  });
});