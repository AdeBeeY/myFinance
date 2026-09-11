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

import MonthlyTrendsSection from "../components/reports/MonthlyTrendsSection";

import {
  getMonthlyTrends,
} from "../api/reportApi";

vi.mock("../api/reportApi", () => ({
  getMonthlyTrends: vi.fn(),
}));

describe("MonthlyTrendsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads and renders monthly income and expense trends", async () => {
    const user = userEvent.setup();

    getMonthlyTrends.mockResolvedValue({
      data: [
        {
          month: 1,
          income: 100000,
          expense: 50000,
        },
        {
          month: 2,
          income: 80000,
          expense: 120000,
        },
      ],
    });

    render(
      <MonthlyTrendsSection currency="NGN" />
    );

    const yearInput =
      screen.getByLabelText("Year");

    await user.clear(yearInput);
    await user.type(yearInput, "2026");

    await user.click(
      screen.getByRole("button", {
        name: "View Trends",
      })
    );

    expect(getMonthlyTrends)
      .toHaveBeenCalledWith(2026);

    expect(
      await screen.findByText("January")
    ).toBeInTheDocument();

    expect(
      screen.getByText("February")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦100,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦50,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦80,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦120,000.00")
    ).toBeInTheDocument();
  });

  test("shows an API error when monthly trends cannot be loaded", async () => {
    const user = userEvent.setup();

    getMonthlyTrends.mockRejectedValue(
      new Error(
        "Unable to retrieve monthly trends"
      )
    );

    render(
      <MonthlyTrendsSection currency="NGN" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "View Trends",
      })
    );

    expect(
      await screen.findByText(
        "Unable to retrieve monthly trends"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("January")
    ).not.toBeInTheDocument();
  });
});