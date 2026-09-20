const request = require("supertest");

jest.mock("../src/config/prisma", () => ({
  $queryRaw: jest.fn(),
}));

const prisma = require("../src/config/prisma");
const app = require("../src/app");

describe("MyFinance API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test("GET /health returns healthy status when database is available", async () => {
    prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

    const response = await request(app).get(
      "/health"
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
      database: "connected",
    });

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(
      1
    );
  });

  test("GET /health returns 503 when database is unavailable", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    prisma.$queryRaw.mockRejectedValue(
      new Error("Database unavailable")
    );

    const response = await request(app).get(
      "/health"
    );

    expect(response.status).toBe(503);

    expect(response.body).toEqual({
      status: "error",
      database: "unavailable",
    });

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
