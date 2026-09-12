const errorHandler = require(
  "../../src/middlewares/errorHandler"
);

describe("errorHandler", () => {
  let req;
  let res;
  let next;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();

    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("does not expose internal error messages for 500 errors", () => {
    const error = new Error(
      "Database connection failed at mysql://secret-host"
    );

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });
  });

  it("preserves useful messages for client errors", () => {
    const error = new Error("Transaction not found.");
    error.status = 404;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Transaction not found.",
    });
  });
});