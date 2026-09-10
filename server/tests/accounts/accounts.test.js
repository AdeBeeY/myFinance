const request = require("supertest");

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");

const TEST_EMAIL = "integration-accounts@myfinance.test";
const TEST_PASSWORD = "Password123";

const SECOND_TEST_EMAIL =
  "integration-accounts-second@myfinance.test";

const SECOND_TEST_PASSWORD = "Password123";

let token;
let userId;

const cleanupTestUser = async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          TEST_EMAIL,
          SECOND_TEST_EMAIL,
        ],
      },
    },
  });
};
      

const registerAndLoginTestUser = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Account",
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

const registerAndLoginSecondUser = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Second",
      lastName: "Tester",
      email: SECOND_TEST_EMAIL,
      password: SECOND_TEST_PASSWORD,
      currency: "NGN",
    });

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: SECOND_TEST_EMAIL,
      password: SECOND_TEST_PASSWORD,
    });

  return loginResponse.body.token;
};

describe("Accounts API", () => {
  beforeEach(async () => {
    await cleanupTestUser();
    await registerAndLoginTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser();
    await prisma.$disconnect();
  });

  test("rejects account access without authentication", async () => {
    const response = await request(app)
      .get("/api/accounts");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Authorization header missing.",
    });
  });

  test("creates an account successfully", async () => {
    const response = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Bank Account",
        description: "Primary test account",
      });

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      success: true,
      message: "Account created successfully.",
      data: {
        name: "Bank Account",
        description: "Primary test account",
        balance: 0,
      },
    });

    expect(response.body.data.id).toBeDefined();

    const savedAccount = await prisma.account.findFirst({
      where: {
        userId,
        name: "Bank Account",
      },
    });

    expect(savedAccount).not.toBeNull();
  });

  test("rejects an invalid account name", async () => {
    const response = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "",
      });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      success: false,
      message: "Validation failed.",
    });
  });

  test("rejects duplicate account names", async () => {
    const accountData = {
      name: "Duplicate Account",
      description: "Test duplicate",
    };

    await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(accountData);

    const response = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send(accountData);

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      success: false,
      message: "Account already exists.",
    });
  });

  test("retrieves the authenticated user's accounts", async () => {
    await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Savings",
      });

    await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Cash",
      });

    const response = await request(app)
      .get("/api/accounts")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Accounts retrieved successfully.",
    });

    expect(response.body.data).toHaveLength(2);

    expect(response.body.data.map((account) => account.name))
      .toEqual(["Cash", "Savings"]);
  });

  test("retrieves an account by id", async () => {
    const createResponse = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Wallet",
        description: "Daily wallet",
      });

    const accountId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Account retrieved successfully.",
      data: {
        id: accountId,
        name: "Wallet",
        description: "Daily wallet",
        balance: 0,
      },
    });
  });

  test("updates an account successfully", async () => {
    const createResponse = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Old Account",
        description: "Before update",
      });

    const accountId = createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Account",
        description: "After update",
      });

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Account updated successfully.",
      data: {
        id: accountId,
        name: "Updated Account",
        description: "After update",
      },
    });
  });

  test("deletes an empty account successfully", async () => {
    const createResponse = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Temporary Account",
      });

    const accountId = createResponse.body.data.id;

    const response = await request(app)
      .delete(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Account deleted successfully.",
      data: null,
    });

    const deletedAccount = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });

    expect(deletedAccount).toBeNull();
  });

  test("cannot retrieve another user's account", async () => {
    const createResponse = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Private Account",
      });

    const accountId = createResponse.body.data.id;

    const secondUserToken =
      await registerAndLoginSecondUser();

    const response = await request(app)
      .get(`/api/accounts/${accountId}`)
      .set(
        "Authorization",
        `Bearer ${secondUserToken}`
      );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Account not found.",
    });
  });

  test("cannot update another user's account", async () => {
    const createResponse = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Protected Account",
      });

    const accountId = createResponse.body.data.id;

    const secondUserToken =
      await registerAndLoginSecondUser();

    const response = await request(app)
      .put(`/api/accounts/${accountId}`)
      .set(
        "Authorization",
        `Bearer ${secondUserToken}`
      )
      .send({
        name: "Unauthorized Rename",
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Account not found.",
    });

    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });

    expect(account.name).toBe("Protected Account");
  });

  test("cannot delete another user's account", async () => {
    const createResponse = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Protected Delete Account",
      });

    const accountId = createResponse.body.data.id;

    const secondUserToken =
      await registerAndLoginSecondUser();

    const response = await request(app)
      .delete(`/api/accounts/${accountId}`)
      .set(
        "Authorization",
        `Bearer ${secondUserToken}`
      );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Account not found.",
    });

    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });

    expect(account).not.toBeNull();
  });
});
