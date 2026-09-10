const request = require("supertest");
const app = require("../src/app");

describe("MyFinance API", () => {
  test("test environment uses the isolated database", () => {
    expect(process.env.DATABASE_URL).toContain(
      "myfinance_test"
    );
  });

  test("GET / returns the API welcome message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      message: "Welcome to MyFinance API",
    });
  });
});