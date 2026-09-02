import apiClient from "./apiClient";

export const getAccounts = async () => {
  return apiClient("/accounts");
};

export const getAccountById = async (accountId) => {
  return apiClient(`/accounts/${accountId}`);
};

export const createAccount = async (accountData) => {
  return apiClient("/accounts", {
    method: "POST",
    body: JSON.stringify(accountData),
  });
};

export const updateAccount = async (accountId, accountData) => {
  return apiClient(`/accounts/${accountId}`, {
    method: "PUT",
    body: JSON.stringify(accountData),
  });
};

export const deleteAccount = async (accountId) => {
  return apiClient(`/accounts/${accountId}`, {
    method: "DELETE",
  });
};