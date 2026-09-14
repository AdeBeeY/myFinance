import { Doughnut } from "react-chartjs-2";

import {
  CATEGORY_COLORS,
} from "../../constants/chartColors";

import {
  formatCurrency,
} from "../../utils/currency";

function CategoryDistributionChart({
  expenses,
  currency,
}) {
  const validExpenses = expenses.filter(
    (item) => Number(item.totalExpense) > 0
  );

  if (validExpenses.length === 0) {
    return (
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">
          Category Distribution
        </h2>

        <p className="mt-4 text-gray-600">
          No expense category data available.
        </p>
      </section>
    );
  }

  const data = {
    labels: validExpenses.map(
      (item) => item.categoryName
    ),

    datasets: [
      {
        label: "Expenses",
        data: validExpenses.map((item) =>
          Number(item.totalExpense)
        ),
        backgroundColor: validExpenses.map(
          (_, index) =>
            CATEGORY_COLORS[
              index % CATEGORY_COLORS.length
            ]
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",
      },

      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${formatCurrency(
              context.raw,
              currency
            )}`,
        },
      },
    },
  };

  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">
        Category Distribution
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        How your expenses are distributed across categories
      </p>

      <div className="mt-4 h-80">
        <Doughnut
          data={data}
          options={options}
        />
      </div>
    </section>
  );
}

export default CategoryDistributionChart;