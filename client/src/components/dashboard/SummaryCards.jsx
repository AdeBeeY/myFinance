import { formatCurrency } from "../../utils/currency";

function SummaryCards({ summary, currency }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border p-4">
        <p className="text-sm">Current Balance</p>
        <p className="mt-2 text-2xl font-bold">
          {formatCurrency(summary.currentBalance, currency)}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm">Total Income</p>
        <p className="mt-2 text-2xl font-bold">
          {formatCurrency(summary.totalIncome, currency)}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm">Total Expense</p>
        <p className="mt-2 text-2xl font-bold">
          {formatCurrency(summary.totalExpense, currency)}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm">Accounts</p>
        <p className="mt-2 text-2xl font-bold">
          {summary.totalAccounts}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm">Categories</p>
        <p className="mt-2 text-2xl font-bold">
          {summary.totalCategories}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm">Transactions</p>
        <p className="mt-2 text-2xl font-bold">
          {summary.totalTransactions}
        </p>
      </div>
    </div>
  );
}

export default SummaryCards;