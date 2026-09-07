import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

function RecentTransactions({ transactions, currency }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Recent Transactions</h2>

      {transactions.length === 0 && (
        <div className="mt-4 rounded-lg border bg-white p-6 text-center">
          <p className="text-gray-600">
            No transactions yet.
          </p>

          <Link
            to="/transactions"
            className="mt-3 inline-block text-sm font-medium underline"
          >
            Add your first transaction
          </Link>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Account</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Type</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b last:border-b-0"
                >
                  <td className="p-4">
                    {transaction.description}
                  </td>

                  <td className="p-4">
                    {transaction.category.name}
                  </td>

                  <td className="p-4">
                    {transaction.account.name}
                  </td>

                  <td className="p-4">
                    {formatDate(transaction.transactionDate)}
                  </td>

                  <td
                    className={`p-4 font-medium ${
                      transaction.type === "INCOME"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(transaction.amount, currency)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        transaction.type === "INCOME"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td className="p-4">
                    <Link
                      to={`/transactions/${transaction.id}`}
                      className="text-sm font-medium underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-4">
          <Link
            to="/transactions"
            className="text-sm font-medium underline"
          >
            View all transactions
          </Link>
        </div>
      )}
    </div>
  );
}

export default RecentTransactions;