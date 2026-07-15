const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

const registerUser = async (userData) => {
  const { firstName, lastName, email, password } = userData;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email address already exists.");
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
    },
  });

  return user;
};

module.exports = {
  registerUser,
};