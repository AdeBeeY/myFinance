import { useState } from "react";
import { getMonthlyReport } from "../../api/reportApi";
import { formatCurrency } from "../../utils/currency";
import {
  MONTHS,
  getMonthName,
} from "../../utils/reportUtils";

function MonthlyReportSection({ currency }) {
  const currentDate = new Date();

  const [year, setYear] = useState(
    String(currentDate.getFullYear())
  );

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] =
    useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const numericYear = Number(year);

    if (
      !Number.isInteger(numericYear) ||
      numericYear < 2000 ||
      numericYear > 2100
    ) {
      setError(
        "Year must be between 2000 and 2100."
      );
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await getMonthlyReport(
        numericYear,
        month
      );

      setReport(response.data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load monthly report."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold">
        Monthly Financial Report
      </h2>

      <p className="mt-2 text-gray-600">
        Review your income, expenses, balance,
        and transaction activity for a month.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-4"
      >
        <div>
          <label
            htmlFor="report-month"
            className="mb-1 block text-sm font-medium"
          >
            Month
          </label>

          <select
            id="report-month"
            value={month}
            onChange={(event) =>
              setMonth(
                Number(event.target.value)
              )
            }
            className="rounded border px-3 py-2"
          >
            {MONTHS.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="report-year"
            className="mb-1 block text-sm font-medium"
          >
            Year
          </label>

          <input
            id="report-year"
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(event) =>
              setYear(event.target.value)
            }
            className="w-28 rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading
            ? "Loading..."
            : "View Report"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {report && !error && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold">
            {getMonthName(report.month)}{" "}
            {report.year}
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-600">
                Income
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(
                  report.income,
                  currency
                )}
              </p>
            </div>

            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-600">
                Expenses
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {formatCurrency(
                  report.expense,
                  currency
                )}
              </p>
            </div>

            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-600">
                Net Balance
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  Number(report.balance) < 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {formatCurrency(
                  report.balance,
                  currency
                )}
              </p>
            </div>

            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-600">
                Transactions
              </p>

              <p className="mt-2 text-2xl font-bold">
                {report.transactionCount}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MonthlyReportSection;