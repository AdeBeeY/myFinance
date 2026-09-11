import {
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";

const renderProtectedRoute = () => {
  render(
    <MemoryRouter
      initialEntries={["/dashboard"]}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Protected Dashboard</div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={<div>Login Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("redirects to login when there is no token", () => {
    renderProtectedRoute();

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Protected Dashboard")
    ).not.toBeInTheDocument();
  });

  test("redirects to login when a token exists but the user is missing", () => {
    localStorage.setItem(
      "token",
      "test-token"
    );

    renderProtectedRoute();

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Protected Dashboard")
    ).not.toBeInTheDocument();
  });

  test("renders protected content when token and user exist", () => {
    localStorage.setItem(
      "token",
      "test-token"
    );

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: "test-user-id",
        firstName: "Tax",
        lastName: "Tester",
        email: "tester@myfinance.test",
        currency: "NGN",
      })
    );

    renderProtectedRoute();

    expect(
      screen.getByText("Protected Dashboard")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Login Page")
    ).not.toBeInTheDocument();
  });

  test("redirects to login when stored user data is invalid", () => {
    localStorage.setItem(
      "token",
      "test-token"
    );

    localStorage.setItem(
      "user",
      "invalid-json"
    );

    renderProtectedRoute();

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Protected Dashboard")
    ).not.toBeInTheDocument();
  });
});