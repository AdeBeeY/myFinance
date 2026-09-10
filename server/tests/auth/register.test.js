const request = require("supertest");

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");

const TEST_EMAIL = "integration-register@myfinance.test";

describe("POST /api/auth/register", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: TEST_EMAIL,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: TEST_EMAIL,
      },
    });

    await prisma.$disconnect();
  });

  test("registers a new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        email: TEST_EMAIL,
        password: "Password123",
        currency: "NGN",
      });

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      success: true,
      message: "Account created successfully.",
      user: {
        firstName: "Test",
        lastName: "User",
        email: TEST_EMAIL,
        currency: "NGN",
      },
    });

    expect(response.body.user.id).toBeDefined();

    const savedUser = await prisma.user.findUnique({
      where: {
        email: TEST_EMAIL,
      },
    });

    expect(savedUser).not.toBeNull();
    expect(savedUser.firstName).toBe("Test");
    expect(savedUser.lastName).toBe("User");
    expect(savedUser.currency).toBe("NGN");

    expect(savedUser.password).not.toBe("Password123");
  });
});
