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

import CategorySpendingSection from "../components/reports/CategorySpendingSection";

import {
  getCategorySpendingReport,
} from "../api/reportApi";

vi.mock("../api/reportApi", () => ({
  getCategorySpendingReport: vi.fn(),
}));

describe("CategorySpendingSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads and renders category spending", async () => {
    const user = userEvent.setup();

    getCategorySpendingReport.mockResolvedValue({
      data: [
        {
          categoryId: "food-id",
          categoryName: "Food",
          total: 75000,
        },
        {
          categoryId: "transport-id",
          categoryName: "Transport",
          total: 25000,
        },
      ],
    });

    render(
      <CategorySpendingSection currency="NGN" />
    );

    await user.selectOptions(
      screen.getByLabelText("Month"),
      "8"
    );

    const yearInput =
      screen.getByLabelText("Year");

    await user.clear(yearInput);
    await user.type(yearInput, "2026");

    await user.click(
      screen.getByRole("button", {
        name: "View Spending",
      })
    );

    expect(getCategorySpendingReport)
      .toHaveBeenCalledWith(2026, 8);

    expect(
      await screen.findByText("Food")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Transport")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦75,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦25,000.00")
    ).toBeInTheDocument();
  });

  test("shows an empty state when no expenses exist for the month", async () => {
    const user = userEvent.setup();

    getCategorySpendingReport.mockResolvedValue({
      data: [],
    });

    render(
      <CategorySpendingSection currency="NGN" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "View Spending",
      })
    );

    expect(
      await screen.findByText(
        "No expenses were recorded for this month."
      )
    ).toBeInTheDocument();
  });

  test("shows an API error when category spending cannot be loaded", async () => {
    const user = userEvent.setup();

    getCategorySpendingReport.mockRejectedValue(
      new Error(
        "Unable to retrieve category spending"
      )
    );

    render(
      <CategorySpendingSection currency="NGN" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "View Spending",
      })
    );

    expect(
      await screen.findByText(
        "Unable to retrieve category spending"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "No expenses were recorded for this month."
      )
    ).not.toBeInTheDocument();
  });

  test("formats category spending using the supplied currency", async () => {
    const user = userEvent.setup();

    getCategorySpendingReport.mockResolvedValue({
      data: [
        {
          categoryId: "food-id",
          categoryName: "Food",
          total: 1250.5,
        },
      ],
    });

    render(
      <CategorySpendingSection currency="USD" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "View Spending",
      })
    );

    expect(
      await screen.findByText("$1,250.50")
    ).toBeInTheDocument();
  });
});