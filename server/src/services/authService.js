const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

const DEFAULT_CATEGORIES = require(
  "../constants/defaultCategories"
);

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
  const user = await prisma.$transaction(
    async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          ...(currency && { currency }),
        },
      });

      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map(
          (category) => ({
            ...category,
            userId: createdUser.id,
          })
        ),
      });

      return createdUser;
    }
  );

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

const updateProfile = async (
  userId,
  { firstName, lastName, email, currency }
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      NOT: {
        id: userId,
      },
    },
  });

  if (existingUser) {
    const error = new Error(
      "Email address already exists."
    );
    error.status = 409;

    throw error;
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      firstName,
      lastName,
      email,
      currency,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      currency: true,
    },
  });

  return user;
};

const changePassword = async (
  userId,
  { currentPassword, newPassword }
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    const error = new Error(
      "User account not found."
    );
    error.status = 404;

    throw error;
  }

  const passwordMatch = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!passwordMatch) {
    const error = new Error(
      "Current password is incorrect."
    );
    error.status = 401;

    throw error;
  }

  const samePassword = await bcrypt.compare(
    newPassword,
    user.password
  );

  if (samePassword) {
    const error = new Error(
      "New password must be different from the current password."
    );
    error.status = 400;

    throw error;
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    12
  );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
};