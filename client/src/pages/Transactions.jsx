import { useEffect, useState } from "react";
import {
  createTransaction,
  getTransactions,
} from "../api/transactionApi";
import { getAccounts } from "../api/accountApi";
import { getCategories } from "../api/categoryApi";
import { formatCurrency } from "../utils/currency";
import { getCurrentUser } from "../utils/auth";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Filter state
  const [type, setType] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [search, setSearch] = useState("");

  // Transaction form state
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    amount: "",
    type: "EXPENSE",
    description: "",
    transactionDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    accountId: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const user = getCurrentUser();

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          sort,
        });

        if (type) {
          params.set("type", type);
        }

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await getTransactions(params.toString());

        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message || "Unable to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page, type, sort, search]);

  // Fetch accounts and categories for the transaction form
  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        const [accountsResponse, categoriesResponse] =
          await Promise.all([
            getAccounts(),
            getCategories(),
          ]);

        setAccounts(accountsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        setFormError(
          err.message ||
            "Unable to load accounts and categories."
        );
      }
    };

    fetchFormOptions();
  }, []);

  // Handle form-change 
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "type"
        ? { categoryId: "" }
        : {}),
    }));
  };

  // Handle form submission
  const handleCreateTransaction = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFormError("");

      await createTransaction({
        amount: formData.amount,
        type: formData.type,
        description: formData.description,
        transactionDate: formData.transactionDate,
        categoryId: formData.categoryId,
        accountId: formData.accountId,
      });

      setFormData({
        amount: "",
        type: "EXPENSE",
        description: "",
        transactionDate: new Date()
          .toISOString()
          .split("T")[0],
        categoryId: "",
        accountId: "",
      });

      setPage(1);

      const params = new URLSearchParams({
        page: "1",
        limit: "10",
        sort,
      });

      if (type) {
        params.set("type", type);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await getTransactions(
        params.toString()
      );

      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (err) {
      setFormError(
        err.message || "Unable to create transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Transactions</h1>

      <form
        onSubmit={handleCreateTransaction}
        className="mb-8 rounded-lg border p-4"
      >
        <h2 className="mb-4 text-lg font-semibold">
          Add Transaction
        </h2>

        {formError && (
          <p className="mb-4 text-sm text-red-600">
            {formError}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              className="w-full rounded border px-3 py-2"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Amount
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleFormChange}
              min="0.01"
              step="0.01"
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Account
            </label>

            <select
              name="accountId"
              value={formData.accountId}
              onChange={handleFormChange}
              required
              className="w-full rounded border px-3 py-2"
            >
              <option value="">Select account</option>

              {accounts.map((account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Category
            </label>

            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleFormChange}
              required
              className="w-full rounded border px-3 py-2"
            >
              <option value="">Select category</option>

              {filteredCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Date
            </label>

            <input
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleFormChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              maxLength="191"
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Adding..."
            : "Add Transaction"}
        </button>
      </form>

      {/* Filter Section */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search transactions..."
          className="rounded border px-3 py-2"
        />

        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value);
            setPage(1);
          }}
          className="rounded border px-3 py-2"
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            setPage(1);
          }}
          className="rounded border px-3 py-2"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="amount_desc">Highest amount</option>
          <option value="amount_asc">Lowest amount</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {transaction.category?.name}
                  </h2>

                  <p className="text-sm text-gray-600">
                    {transaction.account?.name}
                  </p>
                </div>

                <p className="font-semibold">
                  {formatCurrency(
                    transaction.amount,
                    user?.currency
                  )}
                </p>
              </div>

              <div className="mt-3 text-sm">
                <p>Type: {transaction.type}</p>

                <p>
                  Date:{" "}
                  {new Date(
                    transaction.transactionDate
                  ).toLocaleDateString()}
                </p>

                {transaction.description && (
                  <p className="mt-2">{transaction.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((previous) => previous - 1)}
            disabled={page === 1}
            className="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <p className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          <button
            type="button"
            onClick={() => setPage((previous) => previous + 1)}
            disabled={page === pagination.totalPages}
            className="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Transactions;