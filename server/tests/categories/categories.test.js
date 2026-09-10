const request = require("supertest");

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");

const TEST_EMAIL = "integration-categories@myfinance.test";
const SECOND_TEST_EMAIL =
  "integration-categories-second@myfinance.test";

const TEST_PASSWORD = "Password123";

let token;
let userId;

const cleanupTestUsers = async () => {
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

const registerAndLoginUser = async ({
  email,
  firstName,
}) => {
  await request(app)
    .post("/api/auth/register")
    .send({
      firstName,
      lastName: "Tester",
      email,
      password: TEST_PASSWORD,
      currency: "NGN",
    });

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password: TEST_PASSWORD,
    });

  return loginResponse;
};

describe("Categories API", () => {
  beforeEach(async () => {
    await cleanupTestUsers();

    const loginResponse =
      await registerAndLoginUser({
        email: TEST_EMAIL,
        firstName: "Category",
      });

    token = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await cleanupTestUsers();
    await prisma.$disconnect();
  });

  test("rejects category access without authentication", async () => {
    const response = await request(app)
      .get("/api/categories");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Authorization header missing.",
    });
  });

  test("creates a category successfully", async () => {
    const response = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Salary",
        type: "INCOME",
        description: "Monthly salary",
      });

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      success: true,
      message: "Category created successfully.",
      data: {
        name: "Salary",
        type: "INCOME",
        description: "Monthly salary",
      },
    });

    expect(response.body.data.id).toBeDefined();

    const savedCategory =
      await prisma.category.findFirst({
        where: {
          userId,
          name: "Salary",
          type: "INCOME",
        },
      });

    expect(savedCategory).not.toBeNull();
  });

  test("rejects invalid category input", async () => {
    const response = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "",
        type: "INVALID",
      });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      success: false,
      message: "Validation failed.",
    });

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "name",
        }),
        expect.objectContaining({
          field: "type",
        }),
      ])
    );
  });

  test("rejects duplicate category with same name and type", async () => {
    const categoryData = {
      name: "Food",
      type: "EXPENSE",
    };

    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send(categoryData);

    const response = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send(categoryData);

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      success: false,
      message: "Category already exists.",
    });
  });

  test("allows the same category name with a different type", async () => {
    const incomeResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Transfer",
        type: "INCOME",
      });

    const expenseResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Transfer",
        type: "EXPENSE",
      });

    expect(incomeResponse.status).toBe(201);
    expect(expenseResponse.status).toBe(201);
  });

  test("retrieves the authenticated user's categories in alphabetical order", async () => {
    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Utilities",
        type: "EXPENSE",
      });

    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Food",
        type: "EXPENSE",
      });

    const response = await request(app)
      .get("/api/categories")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Categories retrieved successfully.",
    });

    expect(response.body.data).toHaveLength(2);

    expect(
      response.body.data.map(
        (category) => category.name
      )
    ).toEqual(["Food", "Utilities"]);
  });

  test("retrieves a category by id", async () => {
    const createResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Transport",
        type: "EXPENSE",
        description: "Transport costs",
      });

    const categoryId =
      createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Category retrieved successfully.",
      data: {
        id: categoryId,
        name: "Transport",
        type: "EXPENSE",
        description: "Transport costs",
      },
    });
  });

  test("updates a category successfully", async () => {
    const createResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Fuel",
        type: "EXPENSE",
        description: "Old description",
      });

    const categoryId =
      createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Vehicle Fuel",
        type: "EXPENSE",
        description: "Updated description",
      });

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Category updated successfully.",
      data: {
        id: categoryId,
        name: "Vehicle Fuel",
        type: "EXPENSE",
        description: "Updated description",
      },
    });
  });

  test("deletes an unused category successfully", async () => {
    const createResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Temporary",
        type: "EXPENSE",
      });

    const categoryId =
      createResponse.body.data.id;

    const response = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Category deleted successfully.",
      data: null,
    });

    const deletedCategory =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    expect(deletedCategory).toBeNull();
  });

  test("cannot retrieve another user's category", async () => {
    const createResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Private Category",
        type: "EXPENSE",
      });

    const categoryId =
      createResponse.body.data.id;

    const secondLogin =
      await registerAndLoginUser({
        email: SECOND_TEST_EMAIL,
        firstName: "Second",
      });

    const secondToken =
      secondLogin.body.token;

    const response = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set(
        "Authorization",
        `Bearer ${secondToken}`
      );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Category not found.",
    });
  });

  test("cannot update another user's category", async () => {
    const createResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Protected Category",
        type: "EXPENSE",
      });

    const categoryId =
      createResponse.body.data.id;

    const secondLogin =
      await registerAndLoginUser({
        email: SECOND_TEST_EMAIL,
        firstName: "Second",
      });

    const secondToken =
      secondLogin.body.token;

    const response = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set(
        "Authorization",
        `Bearer ${secondToken}`
      )
      .send({
        name: "Unauthorized Change",
        type: "EXPENSE",
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Category not found.",
    });

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    expect(category.name).toBe(
      "Protected Category"
    );
  });

  test("cannot delete another user's category", async () => {
    const createResponse = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Protected Delete Category",
        type: "EXPENSE",
      });

    const categoryId =
      createResponse.body.data.id;

    const secondLogin =
      await registerAndLoginUser({
        email: SECOND_TEST_EMAIL,
        firstName: "Second",
      });

    const secondToken =
      secondLogin.body.token;

    const response = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set(
        "Authorization",
        `Bearer ${secondToken}`
      );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Category not found.",
    });

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    expect(category).not.toBeNull();
  });
});
