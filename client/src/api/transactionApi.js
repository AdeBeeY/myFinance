import apiClient from "./apiClient";

export const getTransactions = (queryString = "") => {
  const endpoint = queryString
    ? `/transactions?${queryString}`
    : "/transactions";

  return apiClient(endpoint);
};

export const getTransactionById = (transactionId) => {
  return apiClient(`/transactions/${transactionId}`);
};

export const createTransaction = (transactionData) => {
  return apiClient("/transactions", {
    method: "POST",
    body: JSON.stringify(transactionData),
  });
};

export const updateTransaction = (
  transactionId,
  transactionData
) => {
  return apiClient(`/transactions/${transactionId}`, {
    method: "PUT",
    body: JSON.stringify(transactionData),
  });
};

export const deleteTransaction = (transactionId) => {
  return apiClient(`/transactions/${transactionId}`, {
    method: "DELETE",
  });
};