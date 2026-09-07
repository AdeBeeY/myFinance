import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categoryApi";

const getInitialCategoryFormData = () => ({
  name: "",
  type: "EXPENSE",
  description: "",
});

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState(
    getInitialCategoryFormData()
  );
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCategories();

        setCategories(response.data);
      } catch (err) {
        setError(
          err.message || "Unable to load categories."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleEdit = (category) => {
    setActionError("");
    setEditingCategoryId(category.id);

    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || "",
    });

    setFormError("");
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setFormData(getInitialCategoryFormData());
    setFormError("");
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCategoryId(category.id);
      setActionError("");

      await deleteCategory(category.id);

      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) =>
            currentCategory.id !== category.id
        )
      );

      if (editingCategoryId === category.id) {
        setEditingCategoryId(null);
        setFormData(getInitialCategoryFormData());
        setFormError("");
      }
    } catch (err) {
      setActionError(
        err.message || "Unable to delete category."
      );
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setActionError("");
      setSubmitting(true);
      setFormError("");

      const categoryData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
      };

      if (editingCategoryId) {
        const response = await updateCategory(
          editingCategoryId,
          categoryData
        );

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === editingCategoryId
              ? response.data
              : category
          )
        );

        setEditingCategoryId(null);
      } else {
        const response = await createCategory(
          categoryData
        );

        setCategories((currentCategories) => [
          ...currentCategories,
          response.data,
        ]);
      }

      setFormData(getInitialCategoryFormData());
    } catch (err) {
      setFormError(
        err.message || "Unable to save category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading categories...</p>;
  }

  if (error) {
    return (
      <p className="text-red-600">
        {error}
      </p>
    );
  }

  const incomeCategories = categories.filter(
    (category) => category.type === "INCOME"
  );

  const expenseCategories = categories.filter(
    (category) => category.type === "EXPENSE"
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Categories
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-lg border bg-white p-4 shadow-sm"
      >
        <h2 className="mb-4 text-xl font-semibold">
          {editingCategoryId
            ? "Edit Category"
            : "Add Category"}
        </h2>

        {formError && (
          <p className="mb-4 text-sm text-red-600">
            {formError}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium"
            >
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-1 block text-sm font-medium"
            >
              Type
            </label>

            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            >
              <option value="EXPENSE">
                Expense
              </option>

              <option value="INCOME">
                Income
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? editingCategoryId
              ? "Saving..."
              : "Creating..."
            : editingCategoryId
              ? "Save Changes"
              : "Create Category"}
        </button>

        {editingCategoryId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={submitting}
            className="ml-3 rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </form>

      {actionError && (
        <p className="mb-4 text-sm text-red-600">
          {actionError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Income Categories
          </h2>

          {incomeCategories.length === 0 ? (
            <p className="text-sm text-gray-600">
              No income categories yet.
            </p>
          ) : (
            <div className="space-y-3">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <h3 className="font-semibold">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {category.description}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                      disabled={deletingCategoryId === category.id}
                      className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      disabled={deletingCategoryId === category.id}
                      className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingCategoryId === category.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Expense Categories
          </h2>

          {expenseCategories.length === 0 ? (
            <p className="text-sm text-gray-600">
              No expense categories yet.
            </p>
          ) : (
            <div className="space-y-3">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <h3 className="font-semibold">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {category.description}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                      disabled={deletingCategoryId === category.id}
                      className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      disabled={deletingCategoryId === category.id}
                      className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingCategoryId === category.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Categories;