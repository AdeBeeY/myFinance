const request = require("supertest");

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");

const TEST_EMAIL =
  "integration-transactions@myfinance.test";

const SECOND_TEST_EMAIL =
  "integration-transactions-second@myfinance.test";

const TEST_PASSWORD = "Password123";

let token;
let userId;
let accountId;
let incomeCategoryId;
let expenseCategoryId;

const cleanupTestUsers = async () => {
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
      firstName: "Transaction",
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
      name: "Test Bank",
      description: "Transaction test account",
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

const createSecondUser = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Second",
      lastName: "Tester",
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

describe("Transactions API", () => {
  beforeEach(async () => {
    await cleanupTestUsers();
    await createTestFixtures();
  });

  afterAll(async () => {
    await cleanupTestUsers();
    await prisma.$disconnect();
  });

  test("rejects transaction access without authentication", async () => {
    const response = await request(app)
      .get("/api/transactions");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Authorization header missing.",
    });
  });

  test("creates an income transaction successfully", async () => {
    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 150000,
        type: "INCOME",
        description: "Monthly salary",
        transactionDate: "2026-09-01",
        categoryId: incomeCategoryId,
        accountId,
      });

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      success: true,
      message: "Transaction created successfully.",
      data: {
        type: "INCOME",
        description: "Monthly salary",
        category: {
          id: incomeCategoryId,
          name: "Salary",
          type: "INCOME",
        },
        account: {
          id: accountId,
          name: "Test Bank",
        },
      },
    });

    expect(Number(response.body.data.amount))
      .toBe(150000);

    expect(response.body.data.id).toBeDefined();

    const savedTransaction =
      await prisma.transaction.findFirst({
        where: {
          userId,
          id: response.body.data.id,
        },
      });

    expect(savedTransaction).not.toBeNull();

    expect(Number(savedTransaction.amount))
      .toBe(150000);
  });

  test("creates an expense transaction successfully", async () => {
    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 25000.5,
        type: "EXPENSE",
        description: "Groceries",
        transactionDate: "2026-09-02",
        categoryId: expenseCategoryId,
        accountId,
      });

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      success: true,
      message: "Transaction created successfully.",
      data: {
        type: "EXPENSE",
        description: "Groceries",
      },
    });

    expect(Number(response.body.data.amount))
      .toBe(25000.5);
  });

  test("rejects invalid transaction input", async () => {
    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 0,
        type: "INVALID",
        transactionDate: "not-a-date",
        categoryId: "invalid-id",
        accountId: "invalid-id",
      });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      success: false,
      message: "Validation failed.",
    });
  });

  test("rejects a transaction when type does not match category type", async () => {
    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 50000,
        type: "INCOME",
        description: "Wrong category",
        transactionDate: "2026-09-03",
        categoryId: expenseCategoryId,
        accountId,
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message:
        "Transaction type must match the selected category type.",
    });
  });

  test("retrieves a transaction by id", async () => {
    const createResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 12000,
        type: "EXPENSE",
        description: "Lunch",
        transactionDate: "2026-09-04",
        categoryId: expenseCategoryId,
        accountId,
      });

    const transactionId =
      createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Transaction retrieved successfully.",
      data: {
        id: transactionId,
        type: "EXPENSE",
        description: "Lunch",
        category: {
          id: expenseCategoryId,
          name: "Food",
        },
        account: {
          id: accountId,
          name: "Test Bank",
        },
      },
    });

    expect(Number(response.body.data.amount))
      .toBe(12000);
  });

  test("updates a transaction successfully", async () => {
    const createResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10000,
        type: "EXPENSE",
        description: "Old description",
        transactionDate: "2026-09-05",
        categoryId: expenseCategoryId,
        accountId,
      });

    const transactionId =
      createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 15000,
        description: "Updated description",
      });

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Transaction updated successfully.",
      data: {
        id: transactionId,
        type: "EXPENSE",
        description: "Updated description",
      },
    });

    expect(Number(response.body.data.amount))
      .toBe(15000);

    const updatedTransaction =
      await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

    expect(Number(updatedTransaction.amount))
      .toBe(15000);

    expect(updatedTransaction.description)
      .toBe("Updated description");
  });

  test("deletes a transaction successfully", async () => {
    const createResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 8000,
        type: "EXPENSE",
        description: "Temporary transaction",
        transactionDate: "2026-09-06",
        categoryId: expenseCategoryId,
        accountId,
      });

    const transactionId =
      createResponse.body.data.id;

    const response = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Transaction deleted successfully.",
      data: null,
    });

    const deletedTransaction =
      await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

    expect(deletedTransaction).toBeNull();
  });

  test("cannot retrieve another user's transaction", async () => {
    const createResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 20000,
        type: "EXPENSE",
        description: "Private transaction",
        transactionDate: "2026-09-07",
        categoryId: expenseCategoryId,
        accountId,
      });

    const transactionId =
      createResponse.body.data.id;

    const secondUser = await createSecondUser();

    const response = await request(app)
      .get(`/api/transactions/${transactionId}`)
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Transaction not found.",
    });
  });

  test("cannot update another user's transaction", async () => {
    const createResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 30000,
        type: "EXPENSE",
        description: "Protected transaction",
        transactionDate: "2026-09-08",
        categoryId: expenseCategoryId,
        accountId,
      });

    const transactionId =
      createResponse.body.data.id;

    const secondUser = await createSecondUser();

    const response = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        amount: 99999,
        description: "Unauthorized change",
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Transaction not found.",
    });

    const transaction =
      await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

    expect(Number(transaction.amount))
      .toBe(30000);

    expect(transaction.description)
      .toBe("Protected transaction");
  });

  test("cannot delete another user's transaction", async () => {
    const createResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 40000,
        type: "EXPENSE",
        description: "Protected delete",
        transactionDate: "2026-09-09",
        categoryId: expenseCategoryId,
        accountId,
      });

    const transactionId =
      createResponse.body.data.id;

    const secondUser = await createSecondUser();

    const response = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Transaction not found.",
    });

    const transaction =
      await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

    expect(transaction).not.toBeNull();
  });

  test("cannot create a transaction using another user's account", async () => {
    const secondUser = await createSecondUser();

    const secondAccountResponse = await request(app)
      .post("/api/accounts")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        name: "Second User Bank",
      });

    const secondAccountId =
      secondAccountResponse.body.data.id;

    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 50000,
        type: "EXPENSE",
        description: "Invalid account ownership",
        transactionDate: "2026-09-10",
        categoryId: expenseCategoryId,
        accountId: secondAccountId,
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Account not found.",
    });
  });

  test("cannot create a transaction using another user's category", async () => {
    const secondUser = await createSecondUser();

    const secondCategoryResponse = await request(app)
      .post("/api/categories")
      .set(
        "Authorization",
        `Bearer ${secondUser.token}`
      )
      .send({
        name: "Second User Expense",
        type: "EXPENSE",
      });

    const secondCategoryId =
      secondCategoryResponse.body.data.id;

    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 60000,
        type: "EXPENSE",
        description: "Invalid category ownership",
        transactionDate: "2026-09-10",
        categoryId: secondCategoryId,
        accountId,
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Category not found.",
    });
  });
});
