import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../api/transactionApi";
import { getAccounts } from "../api/accountApi";
import { getCategories } from "../api/categoryApi";
import { formatCurrency } from "../utils/currency";
import { getCurrentUser } from "../utils/auth";

const getInitialTransactionFormData = () => ({
  amount: "",
  type: "EXPENSE",
  description: "",
  transactionDate: new Date().toISOString().split("T")[0],
  categoryId: "",
  accountId: "",
});

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Form Visibility State
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter state
  const [type, setType] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [search, setSearch] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Transaction form state
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState(
    getInitialTransactionFormData
  );

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Editing State
  const [editingTransactionId, setEditingTransactionId] =
    useState(null);

  // Delete State
  const [deletingTransactionId, setDeletingTransactionId] =
    useState(null);

  const user = getCurrentUser();

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  const filterCategories = type
    ? categories.filter(
        (category) => category.type === type
      )
    : categories;

  const hasActiveFilters =
    search.trim() !== "" ||
    type !== "" ||
    accountId !== "" ||
    categoryId !== "" ||
    startDate !== "" ||
    endDate !== "";

  // Active filter labels summary
  const activeFilterLabels = [];

  if (search.trim()) {
    activeFilterLabels.push(`Search: "${search.trim()}"`);
  }

  if (type) {
    activeFilterLabels.push(`Type: ${type}`);
  }

  if (accountId) {
    const selectedAccount = accounts.find(
      (account) => account.id === accountId
    );

    if (selectedAccount) {
      activeFilterLabels.push(
        `Account: ${selectedAccount.name}`
      );
    }
  }

  if (categoryId) {
    const selectedCategory = categories.find(
      (category) => category.id === categoryId
    );

    if (selectedCategory) {
      activeFilterLabels.push(
        `Category: ${selectedCategory.name}`
      );
    }
  }

  if (startDate) {
    activeFilterLabels.push(`From: ${startDate}`);
  }

  if (endDate) {
    activeFilterLabels.push(`To: ${endDate}`);
  }

  // Clear all active filters
  const handleClearFilters = () => {
    setSearch("");
    setType("");
    setAccountId("");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
    setSort("date_desc");
    setPage(1);
  };

  // Fetch transactions based on filters
  const fetchTransactions = useCallback(
    async (targetPage = page) => {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: "10",
        sort,
      });

      if (type) {
        params.set("type", type);
      }

      if (accountId) {
        params.set("accountId", accountId);
      }

      if (categoryId) {
        params.set("categoryId", categoryId);
      }

      if (startDate) {
        params.set("startDate", startDate);
      }

      if (endDate) {
        params.set("endDate", endDate);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await getTransactions(
        params.toString()
      );

      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);

      return response.data;
    },
    [
      page,
      type,
      sort,
      search,
      accountId,
      categoryId,
      startDate,
      endDate,
    ]
  );

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        await fetchTransactions();
      } catch (err) {
        setError(
          err.message || "Unable to load transactions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [fetchTransactions]);

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

  // Handle form change
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

  // Handle Editing Transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransactionId(transaction.id);
    setIsFormOpen(true);

    setFormData({
      amount: String(transaction.amount),
      type: transaction.type,
      description: transaction.description || "",
      transactionDate: new Date(transaction.transactionDate)
        .toISOString()
        .split("T")[0],
      categoryId: transaction.category?.id || "",
      accountId: transaction.account?.id || "",
    });

    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel Editing/Creating Transaction
  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setIsFormOpen(false);
    setFormData(getInitialTransactionFormData());
    setFormError("");
  };

  // Handle Deleting Transaction
  const handleDeleteTransaction = async (transactionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTransactionId(transactionId);
      setActionError("");

      await deleteTransaction(transactionId);

      const refreshedData = await fetchTransactions(page);

      const {
        transactions: refreshedTransactions,
        pagination: refreshedPagination,
      } = refreshedData;

      const lastValidPage = Math.max(
        refreshedPagination.totalPages,
        1
      );

      if (
        refreshedTransactions.length === 0 &&
        page > lastValidPage
      ) {
        setPage(lastValidPage);
        return;
      }

      setTransactions(refreshedTransactions);
      setPagination(refreshedPagination);
    } catch (err) {
      setActionError(
        err.message || "Unable to delete transaction."
      );
    } finally {
      setDeletingTransactionId(null);
    }
  };

  // Handle form submission
  const handleSubmitTransaction = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFormError("");

      const transactionData = {
        amount: formData.amount,
        type: formData.type,
        description: formData.description,
        transactionDate: formData.transactionDate,
        categoryId: formData.categoryId,
        accountId: formData.accountId,
      };

      if (editingTransactionId) {
        await updateTransaction(
          editingTransactionId,
          transactionData
        );
      } else {
        await createTransaction(transactionData);
      }

      setEditingTransactionId(null);
      setFormData(getInitialTransactionFormData());
      setIsFormOpen(false);

      setPage(1);

      await fetchTransactions(1);
    } catch (err) {
      setFormError(
        err.message ||
          (editingTransactionId
            ? "Unable to update transaction."
            : "Unable to create transaction.")
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

      {!isFormOpen && (
        <button
          type="button"
          onClick={() => {
            setEditingTransactionId(null);
            setFormData(getInitialTransactionFormData());
            setFormError("");
            setIsFormOpen(true);
          }}
          className="mb-6 rounded border px-4 py-2"
        >
          + Add Transaction
        </button>
      )}

      {isFormOpen && (
        <form
          onSubmit={handleSubmitTransaction}
          className="mb-8 rounded-lg border p-4"
        >
          <h2 className="mb-4 text-lg font-semibold">
            {editingTransactionId
              ? "Edit Transaction"
              : "Add Transaction"}
          </h2>

          {formError && (
            <p className="mb-4 text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="transaction-type"
                className="mb-1 block text-sm font-medium"
              >
                Type
              </label>

              <select
                id="transaction-type"
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
              <label
                htmlFor="transaction-amount"
                className="mb-1 block text-sm font-medium"
              >
                Amount
              </label>

              <input
                id="transaction-amount"
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
              <label 
                htmlFor="transaction-account"
                className="mb-1 block text-sm font-medium">
                Account
              </label>

              <select
                id="transaction-account"
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
              <label 
                htmlFor="transaction-category"
                className="mb-1 block text-sm font-medium">
                Category
              </label>

              <select
                id="transaction-category"
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
              <label 
                htmlFor="transaction-date"
                className="mb-1 block text-sm font-medium">
                Date
              </label>

              <input
                id="transaction-date"
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleFormChange}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label 
                htmlFor="transaction-description"
                className="mb-1 block text-sm font-medium">
                Description
              </label>

              <input
                id="transaction-description"
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
              ? editingTransactionId
                ? "Updating..."
                : "Adding..."
              : editingTransactionId
                ? "Update Transaction"
                : "Add Transaction"}
          </button>

          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={submitting}
            className="ml-3 rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Filter Section */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            setCategoryId("");
            setPage(1);
          }}
          className="rounded border px-3 py-2"
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>

        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setPage(1);
          }}
          className="rounded border px-3 py-2"
        >
          <option value="">All categories</option>

          {filterCategories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
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

        <select
          value={accountId}
          onChange={(event) => {
            setAccountId(event.target.value);
            setPage(1);
          }}
          className="rounded border px-3 py-2"
        >
          <option value="">All accounts</option>

          {accounts.map((account) => (
            <option
              key={account.id}
              value={account.id}
            >
              {account.name}
            </option>
          ))}
        </select>

        <div>
          <label 
            htmlFor="transaction-start-date"
            className="mb-1 block text-sm font-medium"
          >
            From
          </label>

          <input
            id="transaction-start-date"
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setPage(1);
            }}
            max={endDate || undefined}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="transaction-end-date"
            className="mb-1 block text-sm font-medium"
          >
            To
          </label>

          <input
            id="transaction-end-date"
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setPage(1);
            }}
            min={startDate || undefined}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full rounded border px-4 py-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {activeFilterLabels.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilterLabels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {pagination && (
        <p className="mb-4 text-sm text-gray-600">
          {pagination.total === 1
            ? "1 transaction found"
            : `${pagination.total} transactions found`}
        </p>
      )}

      {actionError && (
        <p className="mb-4 text-sm text-red-600">
          {actionError}
        </p>
      )}

      {transactions.length === 0 ? (
        <div className="rounded-lg border p-6 text-center">
          {hasActiveFilters ? (
            <>
              <h2 className="font-semibold">
                No matching transactions
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Try changing or clearing your filters.
              </p>

              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 rounded border px-4 py-2 text-sm"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <h2 className="font-semibold">
                No transactions yet
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Add your first transaction using the form above.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
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

                <p
                  className={`font-semibold ${
                    transaction.type === "INCOME"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(
                    transaction.amount,
                    user?.currency
                  )}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    transaction.type === "INCOME"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {transaction.type}
                </span>

                <p className="text-gray-600">
                  {new Date(
                    transaction.transactionDate
                  ).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {transaction.description && (
                <p className="mt-3 text-sm text-gray-700">
                  {transaction.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/transactions/${transaction.id}`}
                  className="rounded border px-3 py-2 text-sm"
                >
                  View Details
                </Link>

                <button
                  type="button"
                  onClick={() => handleEditTransaction(transaction)}
                  className="rounded border px-3 py-2 text-sm"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteTransaction(transaction.id)
                  }
                  disabled={
                    deletingTransactionId === transaction.id
                  }
                  className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingTransactionId === transaction.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
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