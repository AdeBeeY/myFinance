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

import MonthlyIncomeChart from "../components/dashboard/MonthlyIncomeChart";

const lineChartMock = vi.fn();

vi.mock("react-chartjs-2", () => ({
  Line: (props) => {
    lineChartMock(props);

    return (
      <div data-testid="monthly-income-chart">
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
      income:
        index === 0
          ? 150000
          : index === 1
            ? 200000
            : 0,
      expense: 0,
    })
  );

describe("MonthlyIncomeChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders monthly income chart data", () => {
    const trends = createTrends();

    render(
      <MonthlyIncomeChart
        trends={trends}
        currency="NGN"
        year={2026}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Monthly Income",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Income received each month in 2026"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "monthly-income-chart"
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
      150000,
      200000,
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

  test("shows an empty state when there is no income", () => {
    const trends = Array.from(
      { length: 12 },
      (_, index) => ({
        month: index + 1,
        income: 0,
        expense: 0,
      })
    );

    render(
      <MonthlyIncomeChart
        trends={trends}
        currency="NGN"
        year={2026}
      />
    );

    expect(
      screen.getByText(
        "No income data available for 2026."
      )
    ).toBeInTheDocument();

    expect(lineChartMock).not.toHaveBeenCalled();
  });

  test("formats tooltip values using the selected currency", () => {
    render(
      <MonthlyIncomeChart
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
          raw: 150000,
        }
      );

    expect(tooltipLabel).toContain(
      "$150,000.00"
    );
  });
});