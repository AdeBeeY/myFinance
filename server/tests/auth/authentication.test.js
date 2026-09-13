const request = require("supertest");

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");

const TEST_EMAIL = "integration-auth@myfinance.test";
const SECOND_TEST_EMAIL =
  "integration-auth-second@myfinance.test";
const TEST_PASSWORD = "Password123";

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

const loginTestUser = async () => {
  return request(app)
    .post("/api/auth/login")
    .send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
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

  test("updates the authenticated user's profile", async () => {
    await registerTestUser();

    const loginResponse = await loginTestUser();
    const token = loginResponse.body.token;

    const response = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Updated",
        lastName: "User",
        email: TEST_EMAIL,
        currency: "USD",
      });

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Profile updated successfully.",
      user: {
        firstName: "Updated",
        lastName: "User",
        email: TEST_EMAIL,
        currency: "USD",
      },
    });

    expect(response.body.user.password).toBeUndefined();

    const updatedUser =
      await prisma.user.findUnique({
        where: {
          email: TEST_EMAIL,
        },
      });

    expect(updatedUser.firstName).toBe(
      "Updated"
    );

    expect(updatedUser.lastName).toBe(
      "User"
    );

    expect(updatedUser.currency).toBe("USD");
  });

  test("rejects profile update without authorization", async () => {
    const response = await request(app)
      .put("/api/auth/profile")
      .send({
        firstName: "Updated",
        lastName: "User",
        email: TEST_EMAIL,
        currency: "NGN",
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Authorization header missing.",
    });
  });

  test("rejects profile update with invalid currency", async () => {
    await registerTestUser();

    const loginResponse = await loginTestUser();
    const token = loginResponse.body.token;

    const response = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Auth",
        lastName: "Tester",
        email: TEST_EMAIL,
        currency: "CAD",
      });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      success: false,
      message: "Validation failed.",
    });

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "currency",
        }),
      ])
    );
  });

  test("rejects profile update with invalid email", async () => {
    await registerTestUser();

    const loginResponse = await loginTestUser();
    const token = loginResponse.body.token;

    const response = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Auth",
        lastName: "Tester",
        email: "invalid-email",
        currency: "NGN",
      });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      success: false,
      message: "Validation failed.",
    });

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "email",
        }),
      ])
    );
  });

  test("rejects profile update when email belongs to another user", async () => {
    await registerTestUser();

    await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Second",
        lastName: "User",
        email: SECOND_TEST_EMAIL,
        password: TEST_PASSWORD,
        currency: "NGN",
      });

    const loginResponse = await loginTestUser();
    const token = loginResponse.body.token;

    const response = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Auth",
        lastName: "Tester",
        email: SECOND_TEST_EMAIL,
        currency: "NGN",
      });

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      success: false,
      message: "Email address already exists.",
    });
  });

  test("changes the authenticated user's password", async () => {
    await registerTestUser();

    const loginResponse = await loginTestUser();
    const token = loginResponse.body.token;

    const response = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: TEST_PASSWORD,
        newPassword: "NewPassword456",
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Password changed successfully.",
    });

    const oldPasswordLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

    expect(oldPasswordLogin.status).toBe(401);

    const newPasswordLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: TEST_EMAIL,
        password: "NewPassword456",
      });

    expect(newPasswordLogin.status).toBe(200);
    expect(newPasswordLogin.body.token).toEqual(
      expect.any(String)
    );
  });

  test("rejects password change with incorrect current password", async () => {
    await registerTestUser();

    const loginResponse = await loginTestUser();
    const token = loginResponse.body.token;

    const response = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "WrongPassword123",
        newPassword: "NewPassword456",
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Current password is incorrect.",
    });
  });

  test("rejects reusing the current password as the new password", async () => {
    await registerTestUser();

    const loginResponse = await loginTestUser();
    const token = loginResponse.body.token;

    const response = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: TEST_PASSWORD,
        newPassword: TEST_PASSWORD,
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      success: false,
      message:
        "New password must be different from the current password.",
    });
  });

  test("rejects password change when new password is too short", async () => {
    await registerTestUser();

    const loginResponse = await loginTestUser();
    const token = loginResponse.body.token;

    const response = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: TEST_PASSWORD,
        newPassword: "short",
      });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      success: false,
      message: "Validation failed.",
    });

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "newPassword",
        }),
      ])
    );
  });

  test("rejects password change without authorization", async () => {
    const response = await request(app)
      .put("/api/auth/change-password")
      .send({
        currentPassword: TEST_PASSWORD,
        newPassword: "NewPassword456",
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Authorization header missing.",
    });
  });
});