import { useEffect, useState } from "react";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../api/accountApi";
import { getCurrentUser } from "../utils/auth";
import { formatCurrency } from "../utils/currency";

function Accounts() {
  const user = getCurrentUser();

  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Edit Form states
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete states
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await getAccounts();

        setAccounts(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  // Create Handlers
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");
    setDeleteError("");
    setIsCreating(true);

    try {
      const response = await createAccount(formData);

      setAccounts((previous) => [
        ...previous,
        response.data,
      ]);

      setFormData({
        name: "",
        description: "",
      });

      setSuccessMessage("Account created successfully.");
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Edit Handlers
  const handleEditClick = (account) => {
    setEditingAccountId(account.id);

    setEditFormData({
      name: account.name,
      description: account.description || "",
    });

    setEditError("");
    setSuccessMessage("");
    setDeleteError("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateAccount = async (event) => {
    event.preventDefault();

    setEditError("");
    setSuccessMessage("");
    setDeleteError("");
    setIsUpdating(true);

    try {
      const response = await updateAccount(
        editingAccountId,
        editFormData
      );

      setAccounts((previous) =>
        previous.map((account) =>
          account.id === editingAccountId
            ? response.data
            : account
        )
      );

      setEditingAccountId(null);

      setEditFormData({
        name: "",
        description: "",
      });

      setSuccessMessage("Account updated successfully.");
    } catch (error) {
      setEditError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Handler
  const handleDeleteAccount = async (accountId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account?"
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setSuccessMessage("");
    setIsDeleting(true);

    try {
      await deleteAccount(accountId);

      setAccounts((previous) =>
        previous.filter((account) => account.id !== accountId)
      );

      setSuccessMessage("Account deleted successfully.");
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <p>Loading accounts...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        My Accounts
      </h1>

      {/* Create Account Form */}
      <form
        onSubmit={handleCreateAccount}
        className="mb-8 space-y-4 border p-4 rounded"
      >
        <h2 className="text-xl font-semibold">
          Create Account
        </h2>

        {formError && (
          <p className="text-red-600">
            {formError}
          </p>
        )}

        {successMessage && (
          <p className="text-green-600">
            {successMessage}
          </p>
        )}

        <div>
          <label htmlFor="name" className="block mb-1">
            Account Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={50}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-1">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={191}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="border px-4 py-2 rounded disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create Account"}
        </button>
      </form>

      {/* Page-level Delete Error */}
      {deleteError && (
        <p className="text-red-600 mb-4">
          {deleteError}
        </p>
      )}

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <p>No accounts found.</p>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="border p-4 rounded"
            >
              {editingAccountId === account.id ? (
                <form
                  onSubmit={handleUpdateAccount}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold">
                    Edit Account
                  </h2>

                  {editError && (
                    <p className="text-red-600">
                      {editError}
                    </p>
                  )}

                  <div>
                    <label
                      htmlFor={`edit-name-${account.id}`}
                      className="block mb-1"
                    >
                      Account Name
                    </label>

                    <input
                      id={`edit-name-${account.id}`}
                      name="name"
                      type="text"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      required
                      minLength={2}
                      maxLength={50}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`edit-description-${account.id}`}
                      className="block mb-1"
                    >
                      Description
                    </label>

                    <textarea
                      id={`edit-description-${account.id}`}
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      maxLength={191}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="border px-4 py-2 rounded disabled:opacity-50"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingAccountId(null);
                        setEditError("");
                      }}
                      className="border px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">
                    {account.name}
                  </h2>

                  {account.description && (
                    <p className="mt-1">{account.description}</p>
                  )}

                  <p className="mt-2 font-medium">
                    Balance: {formatCurrency(account.balance, user?.currency)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(account)}
                      className="border px-4 py-2 mt-3 rounded"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(account.id)}
                      disabled={isDeleting}
                      className="border px-4 py-2 mt-3 rounded disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Accounts;