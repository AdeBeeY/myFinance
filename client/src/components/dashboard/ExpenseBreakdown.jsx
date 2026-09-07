import { formatCurrency } from "../../utils/currency";

function ExpenseBreakdown({
  expenses,
  currency,
}) {
  const totalExpenses = expenses.reduce(
    (total, item) =>
      total + Number(item.totalExpense),
    0
  );

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold">
        Expenses by Category
      </h2>

      {expenses.length === 0 ? (
        <div className="mt-4 rounded-lg border bg-white p-6 text-center">
          <p className="text-gray-600">
            No expense data yet.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4 rounded-lg border bg-white p-5 shadow-sm">
          {expenses.map((item) => {
            const amount = Number(
              item.totalExpense
            );

            const percentage =
              totalExpenses > 0
                ? (amount / totalExpenses) * 100
                : 0;

            return (
              <div key={item.categoryId}>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">
                    {item.categoryName}
                  </p>

                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(
                        amount,
                        currency
                      )}
                    </p>

                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded bg-gray-200">
                  <div
                    className="h-full bg-gray-700"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ExpenseBreakdown;