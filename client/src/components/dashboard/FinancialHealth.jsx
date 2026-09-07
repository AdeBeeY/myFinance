import { formatCurrency } from "../../utils/currency";

function FinancialHealth({ health, currency }) {
  const savingsRate = Number(health.savingsRate);
  const expenseRatio = Number(health.expenseRatio);
  const incomeExpenseRatio = Number(
    health.incomeExpenseRatio
  );

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold">
        Financial Health
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">
            Savings Rate
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              savingsRate < 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {savingsRate.toFixed(2)}%
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Percentage of income remaining after expenses
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">
            Expense Ratio
          </p>

          <p className="mt-2 text-2xl font-bold">
            {expenseRatio.toFixed(2)}%
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Percentage of income spent
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">
            Income / Expense Ratio
          </p>

          <p className="mt-2 text-2xl font-bold">
            {incomeExpenseRatio.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Income earned for every unit spent
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">
          Net Savings
        </p>

        <p
          className={`mt-2 text-xl font-bold ${
            Number(health.balance) < 0
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {formatCurrency(health.balance, currency)}
        </p>
      </div>
    </section>
  );
}

export default FinancialHealth;