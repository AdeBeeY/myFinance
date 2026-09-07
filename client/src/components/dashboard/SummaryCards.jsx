import { formatCurrency } from "../../utils/currency";

function SummaryCards({ summary, currency }) {
  const currentBalance = Number(summary.currentBalance);

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">
          Current Balance
        </p>

        <p
          className={`mt-2 text-2xl font-bold ${
            currentBalance < 0
              ? "text-red-600"
              : "text-gray-900"
          }`}
        >
          {formatCurrency(
            summary.currentBalance,
            currency
          )}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Income minus expenses
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">
          Total Income
        </p>

        <p className="mt-2 text-2xl font-bold text-green-600">
          {formatCurrency(summary.totalIncome, currency)}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">
          Total Expense
        </p>

        <p className="mt-2 text-2xl font-bold text-red-600">
          {formatCurrency(
            summary.totalExpense,
            currency
          )}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">
          Accounts
        </p>

        <p className="mt-2 text-2xl font-bold">
          {summary.totalAccounts}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Active financial accounts
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">
          Categories
        </p>

        <p className="mt-2 text-2xl font-bold">
          {summary.totalCategories}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Income and expense categories
        </p>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">
          Transactions
        </p>

        <p className="mt-2 text-2xl font-bold">
          {summary.totalTransactions}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Recorded transactions
        </p>
      </div>
    </div>
  );
}

export default SummaryCards;