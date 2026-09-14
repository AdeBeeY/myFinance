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

import MonthlyExpenseChart from "../components/dashboard/MonthlyExpenseChart";

const lineChartMock = vi.fn();

vi.mock("react-chartjs-2", () => ({
  Line: (props) => {
    lineChartMock(props);

    return (
      <div data-testid="monthly-expense-chart">
        Chart
      </div>
    );
  },
}));

const createTrends = () =>
  Array.from(
    { length: 12 },
    (_, index) => ({
      month: index + 1,
      income: 0,
      expense:
        index === 0
          ? 50000
          : index === 1
            ? 75000
            : 0,
    })
  );

describe("MonthlyExpenseChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders monthly expense chart data", () => {
    const trends = createTrends();

    render(
      <MonthlyExpenseChart
        trends={trends}
        currency="NGN"
        year={2026}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Monthly Expenses",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Expenses recorded each month in 2026"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "monthly-expense-chart"
      )
    ).toBeInTheDocument();

    expect(lineChartMock).toHaveBeenCalledTimes(
      1
    );

    const chartProps =
      lineChartMock.mock.calls[0][0];

    expect(chartProps.data.labels).toEqual([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]);

    expect(
      chartProps.data.datasets[0].data
    ).toEqual([
      50000,
      75000,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]);
  });

  test("shows an empty state when there are no expenses", () => {
    const trends = Array.from(
      { length: 12 },
      (_, index) => ({
        month: index + 1,
        income: 0,
        expense: 0,
      })
    );

    render(
      <MonthlyExpenseChart
        trends={trends}
        currency="NGN"
        year={2026}
      />
    );

    expect(
      screen.getByText(
        "No expense data available for 2026."
      )
    ).toBeInTheDocument();

    expect(lineChartMock).not.toHaveBeenCalled();
  });

  test("formats tooltip values using the selected currency", () => {
    render(
      <MonthlyExpenseChart
        trends={createTrends()}
        currency="USD"
        year={2026}
      />
    );

    const chartProps =
      lineChartMock.mock.calls[0][0];

    const tooltipLabel =
      chartProps.options.plugins.tooltip.callbacks.label(
        {
          raw: 50000,
        }
      );

    expect(tooltipLabel).toContain(
      "$50,000.00"
    );
  });
});