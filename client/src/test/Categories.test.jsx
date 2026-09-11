import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import Categories from "../pages/Categories";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categoryApi";

vi.mock("../api/categoryApi", () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

const categories = [
  {
    id: "category-1",
    name: "Salary",
    type: "INCOME",
    description: "Monthly salary",
  },
  {
    id: "category-2",
    name: "Food",
    type: "EXPENSE",
    description: "Food expenses",
  },
];

describe("Categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads and displays income and expense categories", async () => {
    getCategories.mockResolvedValue({
      data: categories,
    });

    render(<Categories />);

    expect(
      screen.getByText("Loading categories...")
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: "Categories",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Income Categories",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Expense Categories",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Salary")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Monthly salary")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Food")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Food expenses")
    ).toBeInTheDocument();

    expect(getCategories)
      .toHaveBeenCalledTimes(1);
  });

  test("creates a new category and adds it to the list", async () => {
    const user = userEvent.setup();

    getCategories.mockResolvedValue({
      data: [],
    });

    createCategory.mockResolvedValue({
      data: {
        id: "category-3",
        name: "Transport",
        type: "EXPENSE",
        description: "Daily transport",
      },
    });

    render(<Categories />);

    await screen.findByRole("heading", {
      name: "Categories",
    });

    await user.type(
      screen.getByLabelText("Name"),
      "  Transport  "
    );

    await user.type(
      screen.getByLabelText("Description"),
      "  Daily transport  "
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Category",
      })
    );

    expect(createCategory)
      .toHaveBeenCalledWith({
        name: "Transport",
        type: "EXPENSE",
        description: "Daily transport",
      });

    expect(
      await screen.findByText("Transport")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Daily transport")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Name")
    ).toHaveValue("");

    expect(
      screen.getByLabelText("Description")
    ).toHaveValue("");
  });

  test("edits and updates an existing category", async () => {
    const user = userEvent.setup();

    getCategories.mockResolvedValue({
      data: [categories[1]],
    });

    updateCategory.mockResolvedValue({
      data: {
        id: "category-2",
        name: "Groceries",
        type: "EXPENSE",
        description: "Household groceries",
      },
    });

    render(<Categories />);

    await screen.findByText("Food");

    await user.click(
      screen.getByRole("button", {
        name: "Edit",
      })
    );

    expect(
      screen.getByRole("heading", {
        name: "Edit Category",
      })
    ).toBeInTheDocument();

    const nameInput =
      screen.getByLabelText("Name");

    const descriptionInput =
      screen.getByLabelText("Description");

    await user.clear(nameInput);
    await user.type(
      nameInput,
      "Groceries"
    );

    await user.clear(descriptionInput);
    await user.type(
      descriptionInput,
      "Household groceries"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save Changes",
      })
    );

    expect(updateCategory)
      .toHaveBeenCalledWith(
        "category-2",
        {
          name: "Groceries",
          type: "EXPENSE",
          description: "Household groceries",
        }
      );

    expect(
      await screen.findByText("Groceries")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Household groceries"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Food")
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Add Category",
      })
    ).toBeInTheDocument();
  });

  test("deletes a category after confirmation", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    getCategories.mockResolvedValue({
      data: [categories[1]],
    });

    deleteCategory.mockResolvedValue({
      success: true,
    });

    render(<Categories />);

    await screen.findByText("Food");

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(confirmSpy)
      .toHaveBeenCalledWith(
        'Are you sure you want to delete "Food"?'
      );

    expect(deleteCategory)
      .toHaveBeenCalledWith("category-2");

    expect(
      await screen.findByText(
        "No expense categories yet."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Food")
    ).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test("shows an error when categories cannot be loaded", async () => {
    getCategories.mockRejectedValue(
      new Error(
        "Unable to retrieve categories"
      )
    );

    render(<Categories />);

    expect(
      await screen.findByText(
        "Unable to retrieve categories"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Categories",
      })
    ).not.toBeInTheDocument();
  });
});