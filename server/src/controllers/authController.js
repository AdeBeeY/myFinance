const {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
} = require("../services/authService");

const asyncHandler = require("../helpers/asyncHandler");

const register = asyncHandler(async (req, res) => {

  const user = await registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "Account created successfully.",
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currency: user.currency,
    },
  });
});

const login = asyncHandler(async (req, res) => {

  const result = await loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    token: result.token,
    user: result.user,
  });
});

const profile = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

const updateUserProfile = asyncHandler(
  async (req, res) => {
    const user = await updateProfile(
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  }
);

const changeUserPassword = asyncHandler(
  async (req, res) => {
    await changePassword(
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  }
);

module.exports = {
  register,
  login,
  profile,
  updateUserProfile,
  changeUserPassword,
};