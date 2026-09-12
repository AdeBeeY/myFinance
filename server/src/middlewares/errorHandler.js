const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode =
    err.status || err.statusCode || 500;

  const isServerError = statusCode >= 500;

  const message = isServerError
    ? "Internal Server Error"
    : err.message || "Request failed.";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;