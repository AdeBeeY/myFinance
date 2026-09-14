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

  test("creates default categories for a newly registered user", async () => {
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

    const savedUser = await prisma.user.findUnique({
      where: {
        email: TEST_EMAIL,
      },
    });

    expect(savedUser).not.toBeNull();

    const categories = await prisma.category.findMany({
      where: {
        userId: savedUser.id,
      },
      orderBy: [
        {
          type: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    expect(categories).toHaveLength(17);

    expect(categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Salary",
          type: "INCOME",
        }),
        expect.objectContaining({
          name: "Business",
          type: "INCOME",
        }),
        expect.objectContaining({
          name: "Freelance",
          type: "INCOME",
        }),
        expect.objectContaining({
          name: "Investment",
          type: "INCOME",
        }),
        expect.objectContaining({
          name: "Bonus",
          type: "INCOME",
        }),
        expect.objectContaining({
          name: "Other",
          type: "INCOME",
        }),
        expect.objectContaining({
          name: "Food",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Transport",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Fuel",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Rent",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Electricity",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Internet",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Shopping",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Entertainment",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Medical",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Education",
          type: "EXPENSE",
        }),
        expect.objectContaining({
          name: "Other",
          type: "EXPENSE",
        }),
      ])
    );
  });
});
