import {
  describe,
  expect,
  test,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/react";

import SummaryCards from "../components/dashboard/SummaryCards";

const summary = {
  currentBalance: 370000,
  totalIncome: 500000,
  totalExpense: 130000,
  totalAccounts: 2,
  totalCategories: 5,
  totalTransactions: 12,
};

describe("SummaryCards", () => {
  test("renders the financial summary values", () => {
    render(
      <SummaryCards
        summary={summary}
        currency="NGN"
      />
    );

    expect(
      screen.getByText("Current Balance")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦370,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦500,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦130,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("2")
    ).toBeInTheDocument();

    expect(
      screen.getByText("5")
    ).toBeInTheDocument();

    expect(
      screen.getByText("12")
    ).toBeInTheDocument();
  });

  test("uses the supplied user currency", () => {
    render(
      <SummaryCards
        summary={summary}
        currency="USD"
      />
    );

    expect(
      screen.getByText("$370,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$500,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$130,000.00")
    ).toBeInTheDocument();
  });

  test("shows a negative balance using the negative balance style", () => {
    render(
      <SummaryCards
        summary={{
          ...summary,
          currentBalance: -25000,
        }}
        currency="NGN"
      />
    );

    const balance = screen.getByText(
      "-₦25,000.00"
    );

    expect(balance).toBeInTheDocument();
    expect(balance).toHaveClass("text-red-600");
  });
});