import apiClient from "./apiClient";

export const loginUser = async (credentials) => {
  const response = await apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  localStorage.setItem("token", response.token);
  localStorage.setItem("user", JSON.stringify(response.user));

  return response;
};

export const registerUser = async (userData) => {
  const response = await apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  return response;
};