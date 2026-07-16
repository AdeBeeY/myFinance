const { validationResult } = require("express-validator");
const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: formattedErrors,
      });
    }

    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
      next(error);
    }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: formattedErrors,
      });
    }

    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token: result.token,
      user: result.user,
    });

  } catch (error) {
    next(error);
  }
};

const profile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  register,
  login,
  profile,
};