const request = require("supertest");

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");

const TEST_EMAIL =
  "integration-tax@myfinance.test";

const SECOND_TEST_EMAIL =
  "integration-tax-second@myfinance.test";

const TEST_PASSWORD = "Password123";

let token;
let userId;

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

  await prisma.taxSetting.deleteMany({
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

  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
};

const createTestUser = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Tax",
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
};

const createTaxFixtures = async () => {
  const accountResponse = await request(app)
    .post("/api/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Tax Bank",
      description: "Tax integration test account",
    });

  expect(accountResponse.status).toBe(201);

  const accountId = accountResponse.body.data.id;

  const incomeCategoryResponse = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Tax Income",
      type: "INCOME",
    });

  expect(incomeCategoryResponse.status).toBe(201);

  const incomeCategoryId =
    incomeCategoryResponse.body.data.id;

  const expenseCategoryResponse = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Tax Expense",
      type: "EXPENSE",
    });

  expect(expenseCategoryResponse.status).toBe(201);

  const expenseCategoryId =
    expenseCategoryResponse.body.data.id;

  return {
    accountId,
    incomeCategoryId,
    expenseCategoryId,
  };
};

const createTaxTransaction = async ({
  accountId,
  categoryId,
  amount,
  type,
  description,
  transactionDate,
}) => {
  const response = await request(app)
    .post("/api/transactions")
    .set("Authorization", `Bearer ${token}`)
    .send({
      accountId,
      categoryId,
      amount,
      type,
      description,
      transactionDate,
    });

  expect(response.status).toBe(201);

  return response.body.data;
};

const saveTaxSetting = async ({
  year = 2026,
  taxRate = 10,
} = {}) => {
  const response = await request(app)
    .put("/api/tax/settings")
    .set("Authorization", `Bearer ${token}`)
    .send({
      year,
      taxRate,
    });

  expect(response.status).toBe(200);

  return response.body.data;
};

const createSecondTestUser = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Second",
      lastName: "Tax Tester",
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

  return {
    token: loginResponse.body.token,
    userId: loginResponse.body.user.id,
  };
};

describe("Tax API", () => {
  beforeEach(async () => {
    await cleanupTestUser();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser();
    await prisma.$disconnect();
  });

  test("rejects tax settings access without authentication", async () => {
    const response = await request(app)
      .get("/api/tax/settings");

    expect(response.status).toBe(401);
  });

  test("returns an empty tax settings list when none exist", async () => {
    const response = await request(app)
      .get("/api/tax/settings")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Tax settings retrieved successfully"
    );
    expect(response.body.data).toEqual([]);
  });

  test("creates a tax setting for a year", async () => {
    const response = await request(app)
      .put("/api/tax/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
        taxRate: 10,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Tax setting saved successfully"
    );

    expect(response.body.data).toEqual(
      expect.objectContaining({
        year: 2026,
        taxRate: 10,
        userId,
      })
    );
  });

  test("updates an existing tax setting instead of creating a duplicate", async () => {
    await request(app)
      .put("/api/tax/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
        taxRate: 10,
      });

    const response = await request(app)
      .put("/api/tax/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
        taxRate: 15,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        year: 2026,
        taxRate: 15,
        userId,
      })
    );

    const settings = await prisma.taxSetting.findMany({
      where: {
        userId,
        year: 2026,
      },
    });

    expect(settings).toHaveLength(1);
  });

  test("accepts a zero percent tax rate", async () => {
    const response = await request(app)
      .put("/api/tax/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
        taxRate: 0,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.taxRate).toBe(0);
  });

  test("rejects invalid tax setting values", async () => {
    const response = await request(app)
      .put("/api/tax/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 1999,
        taxRate: 101,
      });

    expect(response.status).toBe(400);
  });

  test("calculates estimated tax for a selected year", async () => {
    const {
      accountId,
      incomeCategoryId,
      expenseCategoryId,
    } = await createTaxFixtures();

    await saveTaxSetting({
      year: 2026,
      taxRate: 10,
    });

    await createTaxTransaction({
      accountId,
      categoryId: incomeCategoryId,
      amount: 500000,
      type: "INCOME",
      description: "2026 income",
      transactionDate: "2026-01-15",
    });

    await createTaxTransaction({
      accountId,
      categoryId: expenseCategoryId,
      amount: 150000,
      type: "EXPENSE",
      description: "2026 expense",
      transactionDate: "2026-02-10",
    });

    const response = await request(app)
      .post("/api/tax/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Tax calculated successfully"
    );

    expect(response.body.data).toEqual({
      year: 2026,
      totalIncome: 500000,
      totalExpense: 150000,
      taxableIncome: 350000,
      taxRate: 10,
      estimatedTax: 35000,
    });
  });

  test("calculates tax using only transactions from the requested year", async () => {
    const {
      accountId,
      incomeCategoryId,
      expenseCategoryId,
    } = await createTaxFixtures();

    await saveTaxSetting({
      year: 2026,
      taxRate: 10,
    });

    await createTaxTransaction({
      accountId,
      categoryId: incomeCategoryId,
      amount: 400000,
      type: "INCOME",
      description: "2026 income",
      transactionDate: "2026-06-15",
    });

    await createTaxTransaction({
      accountId,
      categoryId: expenseCategoryId,
      amount: 100000,
      type: "EXPENSE",
      description: "2026 expense",
      transactionDate: "2026-07-01",
    });

    await createTaxTransaction({
      accountId,
      categoryId: incomeCategoryId,
      amount: 900000,
      type: "INCOME",
      description: "2025 income",
      transactionDate: "2025-12-20",
    });

    const response = await request(app)
      .post("/api/tax/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
      });

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      year: 2026,
      totalIncome: 400000,
      totalExpense: 100000,
      taxableIncome: 300000,
      taxRate: 10,
      estimatedTax: 30000,
    });
  });

  test("retrieves a tax summary for a selected year", async () => {
    const {
      accountId,
      incomeCategoryId,
      expenseCategoryId,
    } = await createTaxFixtures();

    await saveTaxSetting({
      year: 2026,
      taxRate: 20,
    });

    await createTaxTransaction({
      accountId,
      categoryId: incomeCategoryId,
      amount: 300000,
      type: "INCOME",
      description: "Tax summary income",
      transactionDate: "2026-03-01",
    });

    await createTaxTransaction({
      accountId,
      categoryId: expenseCategoryId,
      amount: 50000,
      type: "EXPENSE",
      description: "Tax summary expense",
      transactionDate: "2026-03-15",
    });

    const response = await request(app)
      .get("/api/tax/summary?year=2026")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Tax summary retrieved successfully"
    );

    expect(response.body.data).toEqual({
      year: 2026,
      totalIncome: 300000,
      totalExpense: 50000,
      taxableIncome: 250000,
      taxRate: 20,
      estimatedTax: 50000,
    });
  });

  test("returns 404 when calculating tax without a setting for the year", async () => {
    const response = await request(app)
      .post("/api/tax/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "No tax setting found for 2026"
    );
    expect(response.body.data).toBeNull();
  });

  test("returns 404 when requesting a tax summary without a setting for the year", async () => {
    const response = await request(app)
      .get("/api/tax/summary?year=2026")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "No tax setting found for 2026"
    );
    expect(response.body.data).toBeNull();
  });

  test("does not allow taxable income or estimated tax to become negative", async () => {
    const {
      accountId,
      incomeCategoryId,
      expenseCategoryId,
    } = await createTaxFixtures();

    await saveTaxSetting({
      year: 2026,
      taxRate: 15,
    });

    await createTaxTransaction({
      accountId,
      categoryId: incomeCategoryId,
      amount: 100000,
      type: "INCOME",
      description: "Low income",
      transactionDate: "2026-04-01",
    });

    await createTaxTransaction({
      accountId,
      categoryId: expenseCategoryId,
      amount: 180000,
      type: "EXPENSE",
      description: "High expense",
      transactionDate: "2026-04-15",
    });

    const response = await request(app)
      .post("/api/tax/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
      });

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      year: 2026,
      totalIncome: 100000,
      totalExpense: 180000,
      taxableIncome: 0,
      taxRate: 15,
      estimatedTax: 0,
    });
  });

  test("rejects tax calculation without authentication", async () => {
    const response = await request(app)
      .post("/api/tax/calculate")
      .send({
        year: 2026,
      });

    expect(response.status).toBe(401);
  });

  test("rejects tax summary access without authentication", async () => {
    const response = await request(app)
      .get("/api/tax/summary?year=2026");

    expect(response.status).toBe(401);
  });

  test("rejects an invalid tax calculation year", async () => {
    const response = await request(app)
      .post("/api/tax/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 1999,
      });

    expect(response.status).toBe(400);
  });

  test("rejects an invalid tax summary year", async () => {
    const response = await request(app)
      .get("/api/tax/summary?year=2101")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("tax settings include only the authenticated user's settings", async () => {
    await saveTaxSetting({
      year: 2026,
      taxRate: 10,
    });

    const secondUser = await createSecondTestUser();

    await request(app)
      .put("/api/tax/settings")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        year: 2025,
        taxRate: 30,
      });

    const response = await request(app)
      .get("/api/tax/settings")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        year: 2026,
        taxRate: 10,
        userId,
      })
    );

    expect(
      response.body.data.some(
        (setting) =>
          setting.userId === secondUser.userId
      )
    ).toBe(false);
  });

  test("tax calculation includes only the authenticated user's transactions", async () => {
    const {
      accountId,
      incomeCategoryId,
    } = await createTaxFixtures();

    await saveTaxSetting({
      year: 2026,
      taxRate: 10,
    });

    await createTaxTransaction({
      accountId,
      categoryId: incomeCategoryId,
      amount: 500000,
      type: "INCOME",
      description: "Primary user income",
      transactionDate: "2026-05-01",
    });

    const secondUser = await createSecondTestUser();

    const secondAccountResponse = await request(app)
      .post("/api/accounts")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        name: "Second Tax Bank",
      });

    const secondCategoryResponse = await request(app)
      .post("/api/categories")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        name: "Second Tax Income",
        type: "INCOME",
      });

    await request(app)
      .post("/api/transactions")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        accountId:
          secondAccountResponse.body.data.id,
        categoryId:
          secondCategoryResponse.body.data.id,
        amount: 900000,
        type: "INCOME",
        description: "Second user income",
        transactionDate: "2026-05-10",
      });

    const response = await request(app)
      .post("/api/tax/calculate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        year: 2026,
      });

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      year: 2026,
      totalIncome: 500000,
      totalExpense: 0,
      taxableIncome: 500000,
      taxRate: 10,
      estimatedTax: 50000,
    });
  });
});