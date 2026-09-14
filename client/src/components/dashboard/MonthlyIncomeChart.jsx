import { Line } from "react-chartjs-2";

import {
  formatCurrency,
} from "../../utils/currency";
import {
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

function MonthlyIncomeChart({
  trends,
  currency,
  year,
}) {
  const hasIncome = trends.some(
    (item) => Number(item.income) > 0
  );

  if (!hasIncome) {
    return (
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">
          Monthly Income
        </h2>

        <p className="mt-4 text-gray-600">
          No income data available for {year}.
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
        borderColor: INCOME_COLOR,
        backgroundColor: "rgba(34, 197, 94, 0.2)",
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
            `Income: ${formatCurrency(
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
        Monthly Income
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Income received each month in {year}
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

export default MonthlyIncomeChart;