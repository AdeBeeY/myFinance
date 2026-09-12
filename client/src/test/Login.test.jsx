import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/Login";
import { loginUser } from "../api/authApi";

vi.mock("../api/authApi", () => ({
  loginUser: vi.fn(),
}));

const renderLogin = () => {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<div>Dashboard Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the login form", () => {
    renderLogin();

    expect(
      screen.getByRole("heading", {
        name: "Login",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Login",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Create an account",
      })
    ).toHaveAttribute(
      "href",
      "/register"
    );
  });

  test("submits the entered credentials", async () => {
    const user = userEvent.setup();

    loginUser.mockResolvedValue({
      token: "test-token",
      user: {
        id: "test-user-id",
        email: "joe@example.com",
      },
    });

    renderLogin();

    await user.type(
      screen.getByLabelText("Email"),
      "joe@example.com"
    );

    await user.type(
      screen.getByLabelText("Password"),
      "Password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Login",
      })
    );

    expect(loginUser).toHaveBeenCalledTimes(1);

    expect(loginUser).toHaveBeenCalledWith({
      email: "joe@example.com",
      password: "Password123",
    });
  });

  test("navigates to dashboard after successful login", async () => {
    const user = userEvent.setup();

    loginUser.mockResolvedValue({
      token: "test-token",
      user: {
        id: "test-user-id",
      },
    });

    renderLogin();

    await user.type(
      screen.getByLabelText("Email"),
      "joe@example.com"
    );

    await user.type(
      screen.getByLabelText("Password"),
      "Password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Login",
      })
    );

    expect(
      await screen.findByText("Dashboard Page")
    ).toBeInTheDocument();
  });

  test("shows an error when login fails", async () => {
    const user = userEvent.setup();

    loginUser.mockRejectedValue(
      new Error("Invalid email or password.")
    );

    renderLogin();

    await user.type(
      screen.getByLabelText("Email"),
      "wrong@example.com"
    );

    await user.type(
      screen.getByLabelText("Password"),
      "WrongPassword"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Login",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Invalid email or password."
        )
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText("Dashboard Page")
    ).not.toBeInTheDocument();
  });
});