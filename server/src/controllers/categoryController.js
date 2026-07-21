const categoryService = require("../services/categoryService");
const apiResponse = require("../helpers/apiResponse");
const asyncHandler = require("../helpers/asyncHandler");

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory({
    userId: req.user.id,
    name: req.body.name,
    type: req.body.type,
    description: req.body.description,
  });

  return res.status(201).json(
    apiResponse(
      true,
      "Category created successfully.",
      category
    )
  );
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(
    req.user.id
  );

  return res.status(200).json(
    apiResponse(
      true,
      "Categories retrieved successfully.",
      categories
    )
  );
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(
    req.user.id,
    req.params.id
  );

  return res.status(200).json(
    apiResponse(
      true,
      "Category retrieved successfully.",
      category
    )
  );
});

const updateCategory = asyncHandler(async (req, res) => {
  const updatedCategory = await categoryService.updateCategory(
    req.user.id,
    req.params.id,
    {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
    }
  );

  return res.status(200).json(
    apiResponse(
      true,
      "Category updated successfully.",
      updatedCategory
    )
  );
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(
    req.user.id,
    req.params.id
  );

  return res.status(200).json(
    apiResponse(
      true,
      result.message,
      null
    )
  );
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};