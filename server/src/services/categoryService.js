const prisma = require("../config/prisma");
const AppError = require("../helpers/AppError");

const createCategory = async ({
  userId,
  name,
  type,
  description,
}) => {
  // Check whether the category already exists
  const existingCategory = await prisma.category.findFirst({
    where: {
      userId,
      name,
      type,
    },
  });

  if (existingCategory) {
    throw new AppError(
      "Category already exists.",
      409
    );
  }

  // Create the category
  const category = await prisma.category.create({
    data: {
      userId,
      name,
      type,
      description,
    },
  });

  return category;
};

const getCategories = async (userId) => {
  const categories = await prisma.category.findMany({
    where: {
      userId,
    },

    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

const getCategoryById = async (userId, categoryId) => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  return category;
};

const updateCategory = async (
  userId,
  categoryId,
  { name, type, description }
) => {
  // Ensure the category exists and belongs to the user
  const currentCategory = await getCategoryById(
    userId,
    categoryId
  );

  // Prevent changing the type of a category
  // that is already used by transactions
  if (
    type !== undefined &&
    type !== currentCategory.type
  ) {
    const transactionCount =
      await prisma.transaction.count({
        where: {
          categoryId,
          userId,
        },
      });

    if (transactionCount > 0) {
      throw new AppError(
        "Cannot change the type of a category that is used by transactions.",
        409
      );
    }
  }

  // Check for another category with the same name and type
  const existingCategory = await prisma.category.findFirst({
    where: {
      userId,
      name,
      type,
      NOT: {
        id: categoryId,
      },
    },
  });

  if (existingCategory) {
    throw new AppError("Category already exists.", 409);
  }

  // Update the category
  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name,
      type,
      description,
    },
  });

  return updatedCategory;
};

const deleteCategory = async (userId, categoryId) => {
  // Ensure the category exists and belongs to the user
  await getCategoryById(userId, categoryId);

  // Protect categories that are already used
  // by financial transactions
  const transactionCount =
    await prisma.transaction.count({
      where: {
        categoryId,
        userId,
      },
    });

  if (transactionCount > 0) {
    throw new AppError(
      "Cannot delete a category that has transactions.",
      409
    );
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return {
    message: "Category deleted successfully.",
  };
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};