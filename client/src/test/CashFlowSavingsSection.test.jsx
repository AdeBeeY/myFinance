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

import CashFlowSavingsSection from "../components/reports/CashFlowSavingsSection";

import {
  getCashFlowAnalysis,
  getMonthlySavingsTrend,
} from "../api/reportApi";

vi.mock("../api/reportApi", () => ({
  getCashFlowAnalysis: vi.fn(),
  getMonthlySavingsTrend: vi.fn(),
}));

describe("CashFlowSavingsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads both reports and renders the combined cash-flow data", async () => {
    const user = userEvent.setup();

    getCashFlowAnalysis.mockResolvedValue({
      data: [
        {
          month: 1,
          income: 500000,
          expense: 300000,
          netCashFlow: 200000,
          runningBalance: 200000,
        },
        {
          month: 2,
          income: 400000,
          expense: 450000,
          netCashFlow: -50000,
          runningBalance: 150000,
        },
      ],
    });

    getMonthlySavingsTrend.mockResolvedValue({
      data: [
        {
          month: 1,
          savingsRate: 40,
        },
        {
          month: 2,
          savingsRate: -12.5,
        },
      ],
    });

    render(
      <CashFlowSavingsSection currency="NGN" />
    );

    const yearInput =
      screen.getByLabelText("Year");

    await user.clear(yearInput);
    await user.type(yearInput, "2026");

    await user.click(
      screen.getByRole("button", {
        name: "View Cash Flow",
      })
    );

    expect(getCashFlowAnalysis)
      .toHaveBeenCalledWith(2026);

    expect(getMonthlySavingsTrend)
      .toHaveBeenCalledWith(2026);

    expect(
      await screen.findByText("January")
    ).toBeInTheDocument();

    expect(
      screen.getByText("February")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦500,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("-₦50,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("40.00%")
    ).toBeInTheDocument();

    expect(
      screen.getByText("-12.50%")
    ).toBeInTheDocument();
  });

  test("defaults a missing monthly savings rate to zero", async () => {
    const user = userEvent.setup();

    getCashFlowAnalysis.mockResolvedValue({
      data: [
        {
          month: 3,
          income: 100000,
          expense: 50000,
          netCashFlow: 50000,
          runningBalance: 50000,
        },
      ],
    });

    getMonthlySavingsTrend.mockResolvedValue({
      data: [],
    });

    render(
      <CashFlowSavingsSection currency="NGN" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "View Cash Flow",
      })
    );

    expect(
      await screen.findByText("March")
    ).toBeInTheDocument();

    expect(
      screen.getByText("0.00%")
    ).toBeInTheDocument();
  });

  test("shows an error when one of the report requests fails", async () => {
    const user = userEvent.setup();

    getCashFlowAnalysis.mockResolvedValue({
      data: [],
    });

    getMonthlySavingsTrend.mockRejectedValue(
      new Error(
        "Unable to retrieve savings trend"
      )
    );

    render(
      <CashFlowSavingsSection currency="NGN" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "View Cash Flow",
      })
    );

    expect(
      await screen.findByText(
        "Unable to retrieve savings trend"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("table")
    ).not.toBeInTheDocument();
  });

  test("formats cash-flow amounts using the supplied currency", async () => {
    const user = userEvent.setup();

    getCashFlowAnalysis.mockResolvedValue({
      data: [
        {
          month: 1,
          income: 1250.5,
          expense: 250,
          netCashFlow: 1000.5,
          runningBalance: 1000.5,
        },
      ],
    });

    getMonthlySavingsTrend.mockResolvedValue({
      data: [
        {
          month: 1,
          savingsRate: 80,
        },
      ],
    });

    render(
      <CashFlowSavingsSection currency="USD" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "View Cash Flow",
      })
    );

    expect(
      await screen.findByText("$1,250.50")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$250.00")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("$1,000.50")
    ).toHaveLength(2);

    expect(
      screen.getByText("80.00%")
    ).toBeInTheDocument();
  });
});