import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

function RecentTransactions({ transactions, currency }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Recent Transactions</h2>

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-4">Description</th>
              <th className="p-4">Category</th>
              <th className="p-4">Account</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Type</th>
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

                <td className="p-4 font-medium">
                  {formatCurrency(transaction.amount, currency)}
                </td>

                <td className="p-4">
                  {transaction.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentTransactions;