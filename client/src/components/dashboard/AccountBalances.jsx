import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";

function AccountBalances({ accounts, currency }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">
          Account Balances
        </h2>

        <Link
          to="/accounts"
          className="text-sm font-medium underline"
        >
          View all accounts
        </Link>
      </div>

      {accounts.length === 0 ? (
        <div className="mt-4 rounded-lg border bg-white p-6 text-center">
          <p className="text-gray-600">
            No accounts yet.
          </p>

          <Link
            to="/accounts"
            className="mt-3 inline-block text-sm font-medium underline"
          >
            Create your first account
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const balance = Number(account.balance);

            return (
              <div
                key={account.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <p className="font-semibold">
                  {account.name}
                </p>

                {account.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {account.description}
                  </p>
                )}

                <p
                  className={`mt-3 text-xl font-bold ${
                    balance < 0
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {formatCurrency(
                    account.balance,
                    currency
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AccountBalances;