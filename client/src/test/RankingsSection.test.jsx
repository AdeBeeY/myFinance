import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  MemoryRouter,
} from "react-router-dom";

import RankingsSection from "../components/reports/RankingsSection";

import {
  getLargestTransactions,
  getTopSpendingCategories,
} from "../api/reportApi";

vi.mock("../api/reportApi", () => ({
  getLargestTransactions: vi.fn(),
  getTopSpendingCategories: vi.fn(),
}));

const renderRankings = (
  currency = "NGN"
) => {
  render(
    <MemoryRouter>
      <RankingsSection currency={currency} />
    </MemoryRouter>
  );
};

describe("RankingsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads and renders spending and transaction rankings", async () => {
    const user = userEvent.setup();

    getTopSpendingCategories.mockResolvedValue({
      data: [
        {
          categoryId: "food-id",
          categoryName: "Food",
          totalExpense: 75000,
        },
        {
          categoryId: "transport-id",
          categoryName: "Transport",
          totalExpense: 25000,
        },
      ],
    });

    getLargestTransactions.mockResolvedValue({
      data: [
        {
          transactionId: "transaction-1",
          amount: 120000,
          type: "EXPENSE",
          description: "Laptop repair",
          transactionDate:
            "2026-08-15T10:00:00.000Z",
          category: {
            name: "Technology",
          },
          account: {
            name: "Bank",
          },
        },
      ],
    });

    renderRankings();

    const limitInput =
      screen.getByLabelText(
        "Number of Results"
      );

    await user.clear(limitInput);
    await user.type(limitInput, "10");

    await user.click(
      screen.getByRole("button", {
        name: "View Rankings",
      })
    );

    expect(
      getTopSpendingCategories
    ).toHaveBeenCalledWith(10);

    expect(
      getLargestTransactions
    ).toHaveBeenCalledWith(10);

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

    expect(
      screen.getByText("Laptop repair")
    ).toBeInTheDocument();

    expect(
      screen.getByText("-₦120,000.00")
    ).toBeInTheDocument();

    const detailsLink =
      screen.getByRole("link", {
        name: "View transaction details",
      });

    expect(detailsLink).toHaveAttribute(
      "href",
      "/transactions/transaction-1"
    );
  });

  test("shows empty states when no ranking data exists", async () => {
    const user = userEvent.setup();

    getTopSpendingCategories.mockResolvedValue({
      data: [],
    });

    getLargestTransactions.mockResolvedValue({
      data: [],
    });

    renderRankings();

    await user.click(
      screen.getByRole("button", {
        name: "View Rankings",
      })
    );

    expect(
      await screen.findByText(
        "No expense data available."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "No transactions available."
      )
    ).toBeInTheDocument();
  });

  test("rejects an invalid ranking limit without calling the APIs", async () => {
    const user = userEvent.setup();

    renderRankings();

    const limitInput =
      screen.getByLabelText(
        "Number of Results"
      );

    await user.clear(limitInput);
    await user.type(limitInput, "101");

    const form = screen
      .getByRole("button", {
        name: "View Rankings",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(
      screen.getByText(
        "Limit must be between 1 and 100."
      )
    ).toBeInTheDocument();

    expect(
      getTopSpendingCategories
    ).not.toHaveBeenCalled();

    expect(
      getLargestTransactions
    ).not.toHaveBeenCalled();
  });

  test("shows an error when one ranking request fails", async () => {
    const user = userEvent.setup();

    getTopSpendingCategories.mockResolvedValue({
      data: [],
    });

    getLargestTransactions.mockRejectedValue(
      new Error(
        "Unable to retrieve transaction rankings"
      )
    );

    renderRankings();

    await user.click(
      screen.getByRole("button", {
        name: "View Rankings",
      })
    );

    expect(
      await screen.findByText(
        "Unable to retrieve transaction rankings"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Top Spending Categories"
      )
    ).not.toBeInTheDocument();
  });
});