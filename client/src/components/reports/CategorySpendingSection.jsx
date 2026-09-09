import { useState } from "react";
import { getCategorySpendingReport } from "../../api/reportApi";
import { formatCurrency } from "../../utils/currency";
import { MONTHS } from "../../utils/reportUtils";

function CategorySpendingSection({ currency }) {
  const currentDate = new Date();

  const [year, setYear] = useState(
    String(currentDate.getFullYear())
  );

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [spending, setSpending] = useState([]);
  const [isLoading, setIsLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] =
    useState(false);

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

      const response =
        await getCategorySpendingReport(
          numericYear,
          month
        );

      setSpending(response.data);
      setIsLoaded(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load category spending report."
      );

      setIsLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const highestSpending = Math.max(
    ...spending.map((item) =>
      Number(item.total)
    ),
    1
  );

  return (
    <section className="border-t pt-8">
      <h2 className="text-2xl font-bold">
        Spending by Category
      </h2>

      <p className="mt-2 text-gray-600">
        See which categories account for most
        of your monthly expenses.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-4"
      >
        <div>
          <label
            htmlFor="category-report-month"
            className="mb-1 block text-sm font-medium"
          >
            Month
          </label>

          <select
            id="category-report-month"
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
            htmlFor="category-report-year"
            className="mb-1 block text-sm font-medium"
          >
            Year
          </label>

          <input
            id="category-report-year"
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
            : "View Spending"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {isLoaded &&
        !error &&
        spending.length === 0 && (
          <div className="mt-6 rounded-lg border bg-white p-6 text-gray-600 shadow-sm">
            No expenses were recorded for this
            month.
          </div>
        )}

      {isLoaded &&
        !error &&
        spending.length > 0 && (
          <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
            <div className="space-y-5">
              {spending.map((item) => {
                const width =
                  (Number(item.total) /
                    highestSpending) *
                  100;

                return (
                  <div key={item.categoryId}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">
                        {item.categoryName}
                      </p>

                      <p className="font-semibold">
                        {formatCurrency(
                          item.total,
                          currency
                        )}
                      </p>
                    </div>

                    <div className="mt-2 h-3 overflow-hidden rounded bg-gray-200">
                      <div
                        className="h-full bg-red-600"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </section>
  );
}

export default CategorySpendingSection;