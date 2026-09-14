import { Bar } from "react-chartjs-2";

import {
  formatCurrency,
} from "../../utils/currency";
import {
  EXPENSE_BACKGROUND,
  EXPENSE_COLOR,
  INCOME_BACKGROUND,
  INCOME_COLOR,
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

function IncomeExpenseChart({
  trends,
  currency,
  year,
}) {
  const hasData = trends.some(
    (item) =>
      Number(item.income) > 0 ||
      Number(item.expense) > 0
  );

  if (!hasData) {
    return (
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">
          Income vs Expenses
        </h2>

        <p className="mt-4 text-gray-600">
          No income or expense data available for {year}.
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
        label: "Income",
        data: trends.map((item) =>
          Number(item.income)
        ),
        backgroundColor: INCOME_BACKGROUND,
        borderColor: INCOME_COLOR,
        borderWidth: 1,
      },
      {
        label: "Expenses",
        data: trends.map((item) =>
          Number(item.expense)
        ),
        backgroundColor: EXPENSE_BACKGROUND,
        borderColor: EXPENSE_COLOR,
        borderWidth: 1,
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
            `${context.dataset.label}: ${formatCurrency(
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
        Income vs Expenses
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Monthly financial comparison for {year}
      </p>

      <div className="mt-4 h-80">
        <Bar
          data={data}
          options={options}
        />
      </div>
    </section>
  );
}

export default IncomeExpenseChart;