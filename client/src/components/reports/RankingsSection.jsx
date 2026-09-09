import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getTopSpendingCategories,
  getLargestTransactions,
} from "../../api/reportApi";
import { formatCurrency } from "../../utils/currency";

function RankingsSection({ currency }) {
  const [rankingLimit, setRankingLimit] =
    useState("5");

  const [
    topSpendingCategories,
    setTopSpendingCategories,
  ] = useState([]);

  const [
    largestTransactions,
    setLargestTransactions,
  ] = useState([]);

  const [
    rankingsLoading,
    setRankingsLoading,
  ] = useState(false);

  const [
    rankingsError,
    setRankingsError,
  ] = useState("");

  const [
    rankingsLoaded,
    setRankingsLoaded,
  ] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const numericLimit = Number(rankingLimit);

    if (
      !Number.isInteger(numericLimit) ||
      numericLimit < 1 ||
      numericLimit > 100
    ) {
      setRankingsError(
        "Limit must be between 1 and 100."
      );
      return;
    }

    try {
      setRankingsLoading(true);
      setRankingsError("");

      const [
        categoriesResponse,
        transactionsResponse,
      ] = await Promise.all([
        getTopSpendingCategories(numericLimit),
        getLargestTransactions(numericLimit),
      ]);

      setTopSpendingCategories(
        categoriesResponse.data
      );

      setLargestTransactions(
        transactionsResponse.data
      );

      setRankingsLoaded(true);
    } catch (err) {
      setRankingsError(
        err.message ||
          "Unable to load spending rankings."
      );

      setRankingsLoaded(false);
    } finally {
      setRankingsLoading(false);
    }
  };

  return (
    <section className="border-t pt-8">
      <h2 className="text-2xl font-bold">
        Spending & Transaction Rankings
      </h2>

      <p className="mt-2 text-gray-600">
        Review your highest-spending categories
        and largest individual transactions.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-wrap items-end gap-4"
      >
        <div>
          <label
            htmlFor="ranking-limit"
            className="mb-1 block text-sm font-medium"
          >
            Number of Results
          </label>

          <input
            id="ranking-limit"
            type="number"
            min="1"
            max="100"
            value={rankingLimit}
            onChange={(event) =>
              setRankingLimit(event.target.value)
            }
            className="w-28 rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={rankingsLoading}
          className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {rankingsLoading
            ? "Loading..."
            : "View Rankings"}
        </button>
      </form>

      {rankingsError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {rankingsError}
        </div>
      )}

      {rankingsLoaded && !rankingsError && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">
              Top Spending Categories
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              Highest all-time expense categories.
            </p>

            {topSpendingCategories.length === 0 ? (
              <p className="mt-5 text-gray-600">
                No expense data available.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {topSpendingCategories.map(
                  (item, index) => (
                    <div
                      key={item.categoryId}
                      className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                          {index + 1}
                        </span>

                        <span className="font-medium">
                          {item.categoryName}
                        </span>
                      </div>

                      <span className="font-semibold text-red-600">
                        {formatCurrency(
                          item.totalExpense,
                          currency
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">
              Largest Transactions
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              Highest-value transactions of all
              time.
            </p>

            {largestTransactions.length === 0 ? (
              <p className="mt-5 text-gray-600">
                No transactions available.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {largestTransactions.map(
                  (transaction, index) => (
                    <div
                      key={
                        transaction.transactionId
                      }
                      className="border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-500">
                              #{index + 1}
                            </span>

                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                transaction.type ===
                                "INCOME"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </div>

                          <p className="mt-2 font-medium">
                            {transaction.description ||
                              transaction.category
                                .name}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {
                              transaction.category
                                .name
                            }
                            {" • "}
                            {
                              transaction.account
                                .name
                            }
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(
                              transaction.transactionDate
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <span
                          className={`font-semibold ${
                            transaction.type ===
                            "INCOME"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type ===
                          "INCOME"
                            ? "+"
                            : "-"}
                          {formatCurrency(
                            transaction.amount,
                            currency
                          )}
                        </span>
                      </div>
                      <Link
                        to={`/transactions/${transaction.transactionId}`}
                        className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                      >
                        View transaction details
                      </Link>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default RankingsSection;