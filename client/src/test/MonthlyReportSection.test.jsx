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

import MonthlyReportSection from "../components/reports/MonthlyReportSection";

import {
  getMonthlyReport,
} from "../api/reportApi";

vi.mock("../api/reportApi", () => ({
  getMonthlyReport: vi.fn(),
}));

describe("MonthlyReportSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the monthly report form", () => {
    render(
      <MonthlyReportSection currency="NGN" />
    );

    expect(
      screen.getByRole("heading", {
        name: "Monthly Financial Report",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Month")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Year")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "View Report",
      })
    ).toBeInTheDocument();
  });

  test("loads and renders a monthly financial report", async () => {
    const user = userEvent.setup();

    getMonthlyReport.mockResolvedValue({
      data: {
        year: 2026,
        month: 8,
        income: 500000,
        expense: 130000,
        balance: 370000,
        transactionCount: 4,
      },
    });

    render(
      <MonthlyReportSection currency="NGN" />
    );

    const monthInput =
      screen.getByLabelText("Month");

    const yearInput =
      screen.getByLabelText("Year");

    await user.selectOptions(
      monthInput,
      "8"
    );

    await user.clear(yearInput);
    await user.type(yearInput, "2026");

    await user.click(
      screen.getByRole("button", {
        name: "View Report",
      })
    );

    expect(getMonthlyReport)
      .toHaveBeenCalledWith(2026, 8);

    expect(
      await screen.findByRole("heading", {
        name: "August 2026",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦500,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦130,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₦370,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("4")
    ).toBeInTheDocument();
  });

 test("rejects an invalid year without calling the API", async () => {
    const user = userEvent.setup();

    render(
      <MonthlyReportSection currency="NGN" />
    );

    const yearInput =
      screen.getByLabelText("Year");

    await user.clear(yearInput);
    await user.type(yearInput, "1999");

    const form = screen
      .getByRole("button", {
        name: "View Report",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(
      screen.getByText(
        "Year must be between 2000 and 2100."
      )
    ).toBeInTheDocument();

    expect(getMonthlyReport)
      .not.toHaveBeenCalled();
  });

  test("shows an API error when the monthly report cannot be loaded", async () => {
    const user = userEvent.setup();

    getMonthlyReport.mockRejectedValue(
      new Error(
        "Unable to retrieve monthly report"
      )
    );

    render(
      <MonthlyReportSection currency="NGN" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "View Report",
      })
    );

    expect(
      await screen.findByText(
        "Unable to retrieve monthly report"
      )
    ).toBeInTheDocument();
  });

  test("formats report amounts using the supplied currency", async () => {
    const user = userEvent.setup();

    getMonthlyReport.mockResolvedValue({
      data: {
        year: 2026,
        month: 1,
        income: 1250.5,
        expense: 250,
        balance: 1000.5,
        transactionCount: 2,
      },
    });

    render(
      <MonthlyReportSection currency="USD" />
    );

    await user.selectOptions(
      screen.getByLabelText("Month"),
      "1"
    );

    const yearInput =
      screen.getByLabelText("Year");

    await user.clear(yearInput);
    await user.type(yearInput, "2026");

    await user.click(
      screen.getByRole("button", {
        name: "View Report",
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
  });
});