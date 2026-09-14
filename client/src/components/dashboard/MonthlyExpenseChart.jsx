import { Line } from "react-chartjs-2";

import {
  formatCurrency,
} from "../../utils/currency";
import {
  EXPENSE_COLOR,
} from "../../constants/chartColors";

const MONTH_LABELS = [
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
];

function MonthlyExpenseChart({
  trends,
  currency,
  year,
}) {
  const hasExpenses = trends.some(
    (item) => Number(item.expense) > 0
  );

  if (!hasExpenses) {
    return (
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">
          Monthly Expenses
        </h2>

        <p className="mt-4 text-gray-600">
          No expense data available for {year}.
        </p>
      </section>
    );
  }

  const data = {
    labels: trends.map(
      (item) =>
        MONTH_LABELS[
          Number(item.month) - 1
        ]
    ),

    datasets: [
      {
        label: "Expenses",
        data: trends.map((item) =>
          Number(item.expense)
        ),
        borderColor: EXPENSE_COLOR,
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top",
      },

      tooltip: {
        callbacks: {
          label: (context) =>
            `Expenses: ${formatCurrency(
              context.raw,
              currency
            )}`,
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        ticks: {
          callback: (value) =>
            formatCurrency(
              value,
              currency
            ),
        },
      },
    },
  };

  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">
        Monthly Expenses
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Expenses recorded each month in {year}
      </p>

      <div className="mt-4 h-80">
        <Line
          data={data}
          options={options}
        />
      </div>
    </section>
  );
}

export default MonthlyExpenseChart;