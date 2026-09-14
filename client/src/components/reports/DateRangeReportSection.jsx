import { useState } from "react";
import { getDateRangeReport } from "../../api/reportApi";
import { formatCurrency } from "../../utils/currency";
import {
  getReportPeriod,
} from "../../utils/reportUtils";

function DateRangeReportSection({ currency }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!startDate || !endDate) {
      setError(
        "Start date and end date are required."
      );
      return;
    }

    if (startDate > endDate) {
      setError(
        "End date must be on or after the start date."
      );
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await getDateRangeReport(
        startDate,
        endDate
      );

      setReport(response.data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load date-range report."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodSelect = (period) => {
    const range = getReportPeriod(period);

    if (!range) return;

    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setReport(null);
    setError("");
  };

  return (
    <section className="border-t pt-8">
      <h2 className="text-2xl font-bold">
        Date Range Report
      </h2>

      <p className="mt-2 text-gray-600">
        Analyze your finances between two
        specific dates.
      </p>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700">
          Quick periods
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              handlePeriodSelect("today")
            }
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() =>
              handlePeriodSelect("week")
            }
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            This Week
          </button>

          <button
            type="button"
            onClick={() =>
              handlePeriodSelect("month")
            }
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            This Month
          </button>

          <button
            type="button"
            onClick={() =>
              handlePeriodSelect("year")
            }
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            This Year
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-4"
      >
        <div>
          <label
            htmlFor="start-date"
            className="mb-1 block text-sm font-medium"
          >
            Start Date
          </label>

          <input
            id="start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) =>
              setStartDate(event.target.value)
            }
            className="rounded border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="end-date"
            className="mb-1 block text-sm font-medium"
          >
            End Date
          </label>

          <input
            id="end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) =>
              setEndDate(event.target.value)
            }
            className="rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading
            ? "Generating..."
            : "Generate Report"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {report && !error && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">
            {report.startDate}
            {" → "}
            {report.endDate}
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

export default DateRangeReportSection;