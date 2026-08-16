const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

const registerUser = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    password,
    currency,
  } = userData;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    const error = new Error("Email address already exists.");
    error.status = 409;

    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Save user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      ...(currency && { currency }),
    },
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  // Find the user
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.status = 401;

    throw error;
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const error = new Error("Invalid email or password.");
    error.status = 401;

    throw error;
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currency: user.currency,
    },
  };
};

module.exports = {
  registerUser,
  loginUser,
};