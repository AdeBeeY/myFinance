import { useState } from "react";
import { getMonthlyTrends } from "../../api/reportApi";
import { formatCurrency } from "../../utils/currency";
import { getMonthName } from "../../utils/reportUtils";

function MonthlyTrendsSection({ currency }) {
  const [year, setYear] = useState(
    String(new Date().getFullYear())
  );

  const [monthlyTrends, setMonthlyTrends] =
    useState([]);

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
        await getMonthlyTrends(numericYear);

      setMonthlyTrends(response.data);
      setIsLoaded(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load monthly trends."
      );

      setIsLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="border-t pt-8">
      <h2 className="text-2xl font-bold">
        Monthly Income & Expense Trends
      </h2>

      <p className="mt-2 text-gray-600">
        Compare your income and expenses across
        the year.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-4"
      >
        <div>
          <label
            htmlFor="trend-year"
            className="mb-1 block text-sm font-medium"
          >
            Year
          </label>

          <input
            id="trend-year"
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
            : "View Trends"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {isLoaded &&
        !error &&
        monthlyTrends.length > 0 && (
          <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
            <div className="space-y-5">
              {monthlyTrends.map((item) => {
                const income =
                  Number(item.income);

                const expense =
                  Number(item.expense);

                const maxAmount = Math.max(
                  income,
                  expense,
                  1
                );

                const incomeWidth =
                  (income / maxAmount) * 100;

                const expenseWidth =
                  (expense / maxAmount) * 100;

                return (
                  <div key={item.month}>
                    <p className="font-medium">
                      {getMonthName(
                        item.month
                      )}
                    </p>

                    <div className="mt-2">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-green-700">
                          Income
                        </span>

                        <span>
                          {formatCurrency(
                            income,
                            currency
                          )}
                        </span>
                      </div>

                      <div className="mt-1 h-2 overflow-hidden rounded bg-gray-200">
                        <div
                          className="h-full bg-green-600"
                          style={{
                            width: `${incomeWidth}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-red-700">
                          Expenses
                        </span>

                        <span>
                          {formatCurrency(
                            expense,
                            currency
                          )}
                        </span>
                      </div>

                      <div className="mt-1 h-2 overflow-hidden rounded bg-gray-200">
                        <div
                          className="h-full bg-red-600"
                          style={{
                            width: `${expenseWidth}%`,
                          }}
                        />
                      </div>
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

export default MonthlyTrendsSection;