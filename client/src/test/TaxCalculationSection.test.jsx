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

import TaxCalculationSection from "../components/tax/TaxCalculationSection";

import {
  calculateTax,
  getTaxSummary,
} from "../api/taxApi";

vi.mock("../api/taxApi", () => ({
  calculateTax: vi.fn(),
  getTaxSummary: vi.fn(),
}));

describe("TaxCalculationSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calculates tax and renders the tax summary", async () => {
    const user = userEvent.setup();

    calculateTax.mockResolvedValue({
      success: true,
    });

    getTaxSummary.mockResolvedValue({
      data: {
        year: 2026,
        totalIncome: 500000,
        totalExpense: 130000,
        taxableIncome: 370000,
        taxRate: 10,
        estimatedTax: 37000,
      },
    });

    render(
      <TaxCalculationSection
        selectedYear={2026}
        currency="NGN"
      />
    );

    expect(
      screen.getByText(
        /saved tax rate and transactions for 2026/i
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Calculate Estimated Tax",
      })
    );

    expect(calculateTax)
      .toHaveBeenCalledWith(2026);

    expect(getTaxSummary)
      .toHaveBeenCalledWith(2026);

    expect(
      await screen.findByText("₦500,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦130,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦370,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("10%")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦37,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("2026")
    ).toBeInTheDocument();
  });

  test("retrieves the summary only after tax calculation succeeds", async () => {
    const user = userEvent.setup();

    calculateTax.mockRejectedValue(
      new Error(
        "No tax setting found for 2026"
      )
    );

    render(
      <TaxCalculationSection
        selectedYear={2026}
        currency="NGN"
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Calculate Estimated Tax",
      })
    );

    expect(calculateTax)
      .toHaveBeenCalledWith(2026);

    expect(getTaxSummary)
      .not.toHaveBeenCalled();

    expect(
      await screen.findByText(
        "No tax setting found for 2026"
      )
    ).toBeInTheDocument();
  });

  test("shows an error when the tax summary cannot be retrieved", async () => {
    const user = userEvent.setup();

    calculateTax.mockResolvedValue({
      success: true,
    });

    getTaxSummary.mockRejectedValue(
      new Error(
        "Unable to retrieve tax summary"
      )
    );

    render(
      <TaxCalculationSection
        selectedYear={2026}
        currency="NGN"
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Calculate Estimated Tax",
      })
    );

    expect(calculateTax)
      .toHaveBeenCalledWith(2026);

    expect(getTaxSummary)
      .toHaveBeenCalledWith(2026);

    expect(
      await screen.findByText(
        "Unable to retrieve tax summary"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Total Income")
    ).not.toBeInTheDocument();
  });

  test("formats tax summary amounts using the supplied currency", async () => {
    const user = userEvent.setup();

    calculateTax.mockResolvedValue({
      success: true,
    });

    getTaxSummary.mockResolvedValue({
      data: {
        year: 2026,
        totalIncome: 1250.5,
        totalExpense: 250,
        taxableIncome: 1000.5,
        taxRate: 7.5,
        estimatedTax: 75.0375,
      },
    });

    render(
      <TaxCalculationSection
        selectedYear={2026}
        currency="USD"
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Calculate Estimated Tax",
      })
    );

    expect(
      await screen.findByText("$1,250.50")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$250.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$1,000.50")
    ).toBeInTheDocument();

    expect(
      screen.getByText("7.5%")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$75.04")
    ).toBeInTheDocument();
  });
});