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

import IncomeExpenseChart from "../components/dashboard/IncomeExpenseChart";

const barChartMock = vi.fn();

vi.mock("react-chartjs-2", () => ({
  Bar: (props) => {
    barChartMock(props);

    return (
      <div data-testid="income-expense-chart">
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
      expense:
        index === 0
          ? 50000
          : index === 1
            ? 75000
            : 0,
    })
  );

describe("IncomeExpenseChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders income and expense datasets", () => {
    render(
      <IncomeExpenseChart
        trends={createTrends()}
        currency="NGN"
        year={2026}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Income vs Expenses",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Monthly financial comparison for 2026"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "income-expense-chart"
      )
    ).toBeInTheDocument();

    expect(barChartMock).toHaveBeenCalledTimes(
      1
    );

    const chartProps =
      barChartMock.mock.calls[0][0];

    expect(chartProps.data.labels).toHaveLength(
      12
    );

    expect(
      chartProps.data.datasets[0]
    ).toMatchObject({
      label: "Income",
      data: [
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
      ],
    });

    expect(
      chartProps.data.datasets[1]
    ).toMatchObject({
      label: "Expenses",
      data: [
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
      ],
    });
  });

  test("shows an empty state when there is no financial data", () => {
    const trends = Array.from(
      { length: 12 },
      (_, index) => ({
        month: index + 1,
        income: 0,
        expense: 0,
      })
    );

    render(
      <IncomeExpenseChart
        trends={trends}
        currency="NGN"
        year={2026}
      />
    );

    expect(
      screen.getByText(
        "No income or expense data available for 2026."
      )
    ).toBeInTheDocument();

    expect(barChartMock).not.toHaveBeenCalled();
  });

  test("formats tooltip values using the selected currency", () => {
    render(
      <IncomeExpenseChart
        trends={createTrends()}
        currency="USD"
        year={2026}
      />
    );

    const chartProps =
      barChartMock.mock.calls[0][0];

    const tooltipLabel =
      chartProps.options.plugins.tooltip.callbacks.label(
        {
          dataset: {
            label: "Income",
          },
          raw: 150000,
        }
      );

    expect(tooltipLabel).toContain(
      "Income: $150,000.00"
    );
  });
});