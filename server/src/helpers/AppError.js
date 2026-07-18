class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.status = statusCode;
    this.name = "AppError";

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;