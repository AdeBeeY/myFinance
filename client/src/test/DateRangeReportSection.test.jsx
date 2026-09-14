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

import DateRangeReportSection from "../components/reports/DateRangeReportSection";

import {
  getDateRangeReport,
} from "../api/reportApi";

vi.mock("../api/reportApi", () => ({
  getDateRangeReport: vi.fn(),
}));

describe("DateRangeReportSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the date-range report form", () => {
    render(
      <DateRangeReportSection currency="NGN" />
    );

    expect(
      screen.getByRole("heading", {
        name: "Date Range Report",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Start Date")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("End Date")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Generate Report",
      })
    ).toBeInTheDocument();
  });

  test("loads and renders a valid date-range report", async () => {
    const user = userEvent.setup();

    getDateRangeReport.mockResolvedValue({
      data: {
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        income: 500000,
        expense: 130000,
        balance: 370000,
        transactionCount: 4,
      },
    });

    render(
      <DateRangeReportSection currency="NGN" />
    );

    await user.type(
      screen.getByLabelText("Start Date"),
      "2026-08-01"
    );

    await user.type(
      screen.getByLabelText("End Date"),
      "2026-08-31"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Generate Report",
      })
    );

    expect(getDateRangeReport)
      .toHaveBeenCalledWith(
        "2026-08-01",
        "2026-08-31"
      );

    expect(
      await screen.findByText(
        "2026-08-01 → 2026-08-31"
      )
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

  test("rejects missing dates without calling the API", () => {
    render(
      <DateRangeReportSection currency="NGN" />
    );

    const form = screen
      .getByRole("button", {
        name: "Generate Report",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(
      screen.getByText(
        "Start date and end date are required."
      )
    ).toBeInTheDocument();

    expect(getDateRangeReport)
      .not.toHaveBeenCalled();
  });

  test("rejects an end date before the start date", async () => {
    const user = userEvent.setup();

    render(
      <DateRangeReportSection currency="NGN" />
    );

    await user.type(
      screen.getByLabelText("Start Date"),
      "2026-08-20"
    );

    await user.type(
      screen.getByLabelText("End Date"),
      "2026-08-10"
    );

    const form = screen
      .getByRole("button", {
        name: "Generate Report",
      })
      .closest("form");

    fireEvent.submit(form);

    expect(
      screen.getByText(
        "End date must be on or after the start date."
      )
    ).toBeInTheDocument();

    expect(getDateRangeReport)
      .not.toHaveBeenCalled();
  });

  test("shows an API error when the report cannot be loaded", async () => {
    const user = userEvent.setup();

    getDateRangeReport.mockRejectedValue(
      new Error(
        "Unable to retrieve date-range report"
      )
    );

    render(
      <DateRangeReportSection currency="NGN" />
    );

    await user.type(
      screen.getByLabelText("Start Date"),
      "2026-08-01"
    );

    await user.type(
      screen.getByLabelText("End Date"),
      "2026-08-31"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Generate Report",
      })
    );

    expect(
      await screen.findByText(
        "Unable to retrieve date-range report"
      )
    ).toBeInTheDocument();
  });

  test("applies the Today preset", async () => {
    const user = userEvent.setup();

    render(
      <DateRangeReportSection currency="NGN" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Today",
      })
    );

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    const expectedDate =
      `${year}-${month}-${day}`;

    expect(
      screen.getByLabelText("Start Date")
    ).toHaveValue(expectedDate);

    expect(
      screen.getByLabelText("End Date")
    ).toHaveValue(expectedDate);
  });

  test("applies the This Month preset", async () => {
    const user = userEvent.setup();

    render(
      <DateRangeReportSection currency="NGN" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "This Month",
      })
    );

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    expect(
      screen.getByLabelText("Start Date")
    ).toHaveValue(
      `${year}-${month}-01`
    );

    expect(
      screen.getByLabelText("End Date")
    ).toHaveValue(
      `${year}-${month}-${day}`
    );
  });

  test("submits a quick period through the existing date-range API", async () => {
    const user = userEvent.setup();

    getDateRangeReport.mockResolvedValue({
      data: {
        startDate: "2026-01-01",
        endDate: "2026-09-14",
        income: 100000,
        expense: 40000,
        balance: 60000,
        transactionCount: 5,
      },
    });

    render(
      <DateRangeReportSection currency="NGN" />
    );

    await user.click(
      screen.getByRole("button", {
        name: "This Year",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Generate Report",
      })
    );

    const currentYear =
      new Date().getFullYear();

    expect(getDateRangeReport)
      .toHaveBeenCalledTimes(1);

    expect(getDateRangeReport)
      .toHaveBeenCalledWith(
        `${currentYear}-01-01`,
        expect.stringMatching(
          new RegExp(
            `^${currentYear}-\\d{2}-\\d{2}$`
          )
        )
      );

    expect(
      await screen.findByText("5")
    ).toBeInTheDocument();
  });
});