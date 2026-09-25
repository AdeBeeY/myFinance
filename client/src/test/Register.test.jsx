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
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import Register from "../pages/Register";
import { registerUser } from "../api/authApi";

vi.mock("../api/authApi", () => ({
  registerUser: vi.fn(),
}));

const renderRegister = () => {
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<div>Login Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test("renders the registration form with NGN as the default currency", () => {
    renderRegister();

    expect(
      screen.getByRole("heading", {
        name: "Create your account",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("First Name")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Last Name")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Primary Currency")
    ).toHaveValue("NGN");

    expect(
      screen.getByRole("link", {
        name: "Sign in",
      })
    ).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("submits the entered registration data", async () => {
    const user = userEvent.setup();

    registerUser.mockResolvedValue({
      success: true,
    });

    renderRegister();

    await user.type(
      screen.getByLabelText("First Name"),
      "Joe"
    );

    await user.type(
      screen.getByLabelText("Last Name"),
      "Doe"
    );

    await user.type(
      screen.getByLabelText("Email"),
      "joe@example.com"
    );

    await user.type(
      screen.getByLabelText("Password"),
      "Password123"
    );

    await user.selectOptions(
      screen.getByLabelText("Primary Currency"),
      "USD"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create account",
      })
    );

    expect(registerUser).toHaveBeenCalledTimes(1);

    expect(registerUser).toHaveBeenCalledWith({
      firstName: "Joe",
      lastName: "Doe",
      email: "joe@example.com",
      password: "Password123",
      currency: "USD",
    });
  });

  test("shows a success message after registration", async () => {
    const user = userEvent.setup();

    registerUser.mockResolvedValue({
      success: true,
    });

    renderRegister();

    await user.type(
      screen.getByLabelText("First Name"),
      "Joe"
    );

    await user.type(
      screen.getByLabelText("Last Name"),
      "Doe"
    );

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
        name: "Create account",
      })
    );

    expect(
      await screen.findByText(
        "Account created successfully. You can now log in."
      )
    ).toBeInTheDocument();
  });

  test("shows an error when registration fails", async () => {
    const user = userEvent.setup();

    registerUser.mockRejectedValue(
      new Error("Email already exists.")
    );

    renderRegister();

    await user.type(
      screen.getByLabelText("First Name"),
      "Joe"
    );

    await user.type(
      screen.getByLabelText("Last Name"),
      "Doe"
    );

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
        name: "Create account",
      })
    );

    expect(
      await screen.findByText(
        "Email already exists."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Login Page")
    ).not.toBeInTheDocument();
  });

  test("redirects to login after successful registration", async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });

    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    registerUser.mockResolvedValue({
      success: true,
    });

    renderRegister();

    await user.type(
      screen.getByLabelText("First Name"),
      "Joe"
    );

    await user.type(
      screen.getByLabelText("Last Name"),
      "Doe"
    );

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
        name: "Create account",
      })
    );

    expect(
      await screen.findByText(
        "Account created successfully. You can now log in."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Login Page")
    ).not.toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(1500);

    expect(
      await screen.findByText("Login Page")
    ).toBeInTheDocument();
  });
});