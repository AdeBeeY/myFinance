const request = require("supertest");

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");

const TEST_EMAIL = "integration-auth@myfinance.test";
const TEST_PASSWORD = "Password123";

const cleanupTestUser = async () => {
  await prisma.user.deleteMany({
    where: {
      email: TEST_EMAIL,
    },
  });
};

const registerTestUser = async () => {
  return request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Auth",
      lastName: "Tester",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      currency: "NGN",
    });
};

describe("Authentication API", () => {
  beforeEach(async () => {
    await cleanupTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser();
    await prisma.$disconnect();
  });

  test("rejects invalid registration input", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "",
        lastName: "",
        email: "invalid-email",
        password: "short",
      });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      success: false,
      message: "Validation failed.",
    });

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "firstName",
        }),
        expect.objectContaining({
          field: "lastName",
        }),
        expect.objectContaining({
          field: "email",
        }),
        expect.objectContaining({
          field: "password",
        }),
      ])
    );
  });

  test("rejects duplicate email registration", async () => {
    await registerTestUser();

    const response = await registerTestUser();

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      success: false,
      message: "Email address already exists.",
    });
  });

  test("logs in a registered user successfully", async () => {
    await registerTestUser();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Login successful.",
      user: {
        firstName: "Auth",
        lastName: "Tester",
        email: TEST_EMAIL,
        currency: "NGN",
      },
    });

    expect(response.body.token).toEqual(
      expect.any(String)
    );
  });

  test("rejects login with the wrong password", async () => {
    await registerTestUser();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
        password: "WrongPassword123",
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid email or password.",
    });
  });

  test("rejects login for an unknown email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid email or password.",
    });
  });

  test("returns the authenticated user's profile", async () => {
    await registerTestUser();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      user: {
        firstName: "Auth",
        lastName: "Tester",
        email: TEST_EMAIL,
      },
    });

    expect(response.body.user.id).toBeDefined();
  });

  test("rejects profile request without authorization header", async () => {
    const response = await request(app)
      .get("/api/auth/profile");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Authorization header missing.",
    });
  });

  test("rejects profile request with an invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid or expired token.",
    });
  });
});