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

import CategoryDistributionChart from "../components/dashboard/CategoryDistributionChart";

const doughnutChartMock = vi.fn();

vi.mock("react-chartjs-2", () => ({
  Doughnut: (props) => {
    doughnutChartMock(props);

    return (
      <div data-testid="category-distribution-chart">
        Chart
      </div>
    );
  },
}));

const expenses = [
  {
    categoryId: "category-1",
    categoryName: "Food",
    totalExpense: 50000,
  },
  {
    categoryId: "category-2",
    categoryName: "Transport",
    totalExpense: 30000,
  },
];

describe("CategoryDistributionChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders category expense data", () => {
    render(
      <CategoryDistributionChart
        expenses={expenses}
        currency="NGN"
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Category Distribution",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "category-distribution-chart"
      )
    ).toBeInTheDocument();

    expect(
      doughnutChartMock
    ).toHaveBeenCalledTimes(1);

    const chartProps =
      doughnutChartMock.mock.calls[0][0];

    expect(chartProps.data.labels).toEqual([
      "Food",
      "Transport",
    ]);

    expect(
      chartProps.data.datasets[0].data
    ).toEqual([
      50000,
      30000,
    ]);

    expect(
      chartProps.data.datasets[0]
        .backgroundColor
    ).toHaveLength(2);
  });

  test("shows an empty state when there are no expenses", () => {
    render(
      <CategoryDistributionChart
        expenses={[]}
        currency="NGN"
      />
    );

    expect(
      screen.getByText(
        "No expense category data available."
      )
    ).toBeInTheDocument();

    expect(
      doughnutChartMock
    ).not.toHaveBeenCalled();
  });

  test("ignores categories with no expense amount", () => {
    render(
      <CategoryDistributionChart
        expenses={[
          ...expenses,
          {
            categoryId: "category-3",
            categoryName: "Entertainment",
            totalExpense: 0,
          },
        ]}
        currency="NGN"
      />
    );

    const chartProps =
      doughnutChartMock.mock.calls[0][0];

    expect(chartProps.data.labels).toEqual([
      "Food",
      "Transport",
    ]);
  });

  test("formats tooltip values using the selected currency", () => {
    render(
      <CategoryDistributionChart
        expenses={expenses}
        currency="USD"
      />
    );

    const chartProps =
      doughnutChartMock.mock.calls[0][0];

    const tooltipLabel =
      chartProps.options.plugins.tooltip.callbacks.label(
        {
          label: "Food",
          raw: 50000,
        }
      );

    expect(tooltipLabel).toContain(
      "Food: $50,000.00"
    );
  });
});