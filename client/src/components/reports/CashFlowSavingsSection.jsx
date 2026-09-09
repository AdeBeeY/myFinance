import { useState } from "react";
import {
  getCashFlowAnalysis,
  getMonthlySavingsTrend,
} from "../../api/reportApi";
import { formatCurrency } from "../../utils/currency";
import { getMonthName } from "../../utils/reportUtils";

function CashFlowSavingsSection({ currency }) {
  const [year, setYear] = useState(
    String(new Date().getFullYear())
  );

  const [cashFlow, setCashFlow] =
    useState([]);

  const [savingsTrend, setSavingsTrend] =
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

      const [
        cashFlowResponse,
        savingsTrendResponse,
      ] = await Promise.all([
        getCashFlowAnalysis(numericYear),
        getMonthlySavingsTrend(numericYear),
      ]);

      setCashFlow(cashFlowResponse.data);
      setSavingsTrend(
        savingsTrendResponse.data
      );

      setIsLoaded(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load cash-flow report."
      );

      setIsLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const combinedCashFlow = cashFlow.map(
    (cashFlowItem) => {
      const savingsItem = savingsTrend.find(
        (item) =>
          item.month === cashFlowItem.month
      );

      return {
        ...cashFlowItem,
        savingsRate:
          savingsItem?.savingsRate ?? 0,
      };
    }
  );

  return (
    <section className="border-t pt-8">
      <h2 className="text-2xl font-bold">
        Cash Flow & Savings
      </h2>

      <p className="mt-2 text-gray-600">
        Track monthly cash flow, YTD cash flow,
        and savings performance throughout the
        year.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-4"
      >
        <div>
          <label
            htmlFor="cash-flow-year"
            className="mb-1 block text-sm font-medium"
          >
            Year
          </label>

          <input
            id="cash-flow-year"
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
            : "View Cash Flow"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {isLoaded &&
        !error &&
        combinedCashFlow.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-lg border bg-white shadow-sm">
            <table className="min-w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Month
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    Income
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    Expenses
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    Net Cash Flow
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    YTD Cash Flow
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    Savings Rate
                  </th>
                </tr>
              </thead>

              <tbody>
                {combinedCashFlow.map(
                  (item) => (
                    <tr
                      key={item.month}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        {getMonthName(
                          item.month
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-green-600">
                        {formatCurrency(
                          item.income,
                          currency
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-red-600">
                        {formatCurrency(
                          item.expense,
                          currency
                        )}
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          Number(
                            item.netCashFlow
                          ) < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(
                          item.netCashFlow,
                          currency
                        )}
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          Number(
                            item.runningBalance
                          ) < 0
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {formatCurrency(
                          item.runningBalance,
                          currency
                        )}
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          Number(
                            item.savingsRate
                          ) < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {Number(
                          item.savingsRate
                        ).toFixed(2)}
                        %
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
    </section>
  );
}

export default CashFlowSavingsSection;