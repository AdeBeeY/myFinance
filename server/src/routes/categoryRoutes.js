const express = require("express");

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");
const {
  createCategoryValidator,
  updateCategoryValidator,
} = require("../validators/categoryValidator");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createCategoryValidator,
  validationMiddleware,
  categoryController.createCategory
);

router.get(
  "/",
  authMiddleware,
  categoryController.getCategories
);

router.get(
  "/:id",
  authMiddleware,
  categoryController.getCategoryById
);

router.put(
  "/:id",
  authMiddleware,
  updateCategoryValidator,
  validationMiddleware,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  categoryController.deleteCategory
);

module.exports = router;