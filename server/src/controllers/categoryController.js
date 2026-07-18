const categoryService = require("../services/categoryService");
const apiResponse = require("../helpers/apiResponse");

const createCategory = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};