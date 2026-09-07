import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteTransaction,
  getTransactionById,
} from "../api/transactionApi";
import { getCurrentUser } from "../utils/auth";
import { formatCurrency } from "../utils/currency";

const TransactionDetails = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  const user = getCurrentUser();

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTransactionById(transactionId);

        setTransaction(response.data);
      } catch (err) {
        setError(
          err.message || "Unable to load transaction."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [transactionId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setActionError("");

      await deleteTransaction(transaction.id);

      navigate("/transactions");
    } catch (err) {
      setActionError(
        err.message || "Unable to delete transaction."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p>Loading transaction...</p>;
  }

  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>

        <Link
          to="/transactions"
          className="mt-4 inline-block underline"
        >
          Back to Transactions
        </Link>
      </div>
    );
  }

  if (!transaction) {
    return <p>Transaction not found.</p>;
  }

  return (
    <div>
      <Link
        to="/transactions"
        className="mb-6 inline-block text-sm underline"
      >
        ← Back to Transactions
      </Link>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Transaction Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View the complete information for this transaction.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              transaction.type === "INCOME"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {transaction.type}
          </span>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-500">
            Amount
          </p>

          <p
            className={`mt-1 text-3xl font-bold ${
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

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">
              Date
            </p>

            <p className="mt-1 font-medium">
              {new Date(
                transaction.transactionDate
              ).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Account
            </p>

            <p className="mt-1 font-medium">
              {transaction.account?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Category
            </p>

            <p className="mt-1 font-medium">
              {transaction.category?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Type
            </p>

            <p className="mt-1 font-medium">
              {transaction.type}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-gray-500">
            Description
          </p>

          <p className="mt-2 text-gray-700">
            {transaction.description ||
              "No description provided."}
          </p>
        </div>

        <div className="mt-8 grid gap-4 border-t pt-6 text-sm md:grid-cols-2">
          <div>
            <p className="text-gray-500">
              Created
            </p>

            <p className="mt-1">
              {new Date(
                transaction.createdAt
              ).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Last updated
            </p>

            <p className="mt-1">
              {new Date(
                transaction.updatedAt
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {actionError && (
        <p className="mt-4 text-sm text-red-600">
          {actionError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/transactions"
          className="rounded border px-4 py-2"
        >
          Back
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default TransactionDetails;