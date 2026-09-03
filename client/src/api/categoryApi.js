import apiClient from "./apiClient";

export const getCategories = async () => {
  return apiClient("/categories");
};

export const getCategoryById = async (categoryId) => {
  return apiClient(`/categories/${categoryId}`);
};

export const createCategory = async (categoryData) => {
  return apiClient("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
};

export const updateCategory = async (
  categoryId,
  categoryData
) => {
  return apiClient(`/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
};

export const deleteCategory = async (categoryId) => {
  return apiClient(`/categories/${categoryId}`, {
    method: "DELETE",
  });
};