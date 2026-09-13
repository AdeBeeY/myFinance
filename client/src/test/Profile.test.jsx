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

import Profile from "../pages/Profile";

import {
  changePassword,
  getProfile,
  updateProfile,
} from "../api/authApi";

vi.mock("../api/authApi", () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}));

const profileData = {
  id: "test-user-id",
  firstName: "Joe",
  lastName: "Doe",
  email: "joe@example.com",
  currency: "NGN",
};

const mockProfileLoad = (
  overrides = {}
) => {
  getProfile.mockResolvedValue({
    success: true,
    user: {
      ...profileData,
      ...overrides,
    },
  });
};

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileLoad();
  });

  test("loads and displays the user's profile", async () => {
    render(<Profile />);

    expect(
      screen.getByText("Loading profile...")
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: "Profile",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("First name")
    ).toHaveValue("Joe");

    expect(
      screen.getByLabelText("Last name")
    ).toHaveValue("Doe");

    expect(
      screen.getByLabelText("Email")
    ).toHaveValue("joe@example.com");

    expect(
      screen.getByLabelText("Currency")
    ).toHaveValue("NGN");

    expect(getProfile).toHaveBeenCalledTimes(1);
  });

  test("loads the user's saved currency", async () => {
    mockProfileLoad({
      currency: "USD",
    });

    render(<Profile />);

    expect(
      await screen.findByLabelText("Currency")
    ).toHaveValue("USD");
  });

  test("updates the user's profile", async () => {
    const user = userEvent.setup();

    updateProfile.mockResolvedValue({
      success: true,
      message: "Profile updated successfully.",
      user: {
        ...profileData,
        firstName: "Joseph",
        currency: "USD",
      },
    });

    render(<Profile />);

    const firstName =
      await screen.findByLabelText(
        "First name"
      );

    await user.clear(firstName);
    await user.type(firstName, "Joseph");

    await user.selectOptions(
      screen.getByLabelText("Currency"),
      "USD"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save Profile",
      })
    );

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        firstName: "Joseph",
        lastName: "Doe",
        email: "joe@example.com",
        currency: "USD",
      });
    });

    expect(
      await screen.findByText(
        "Profile updated successfully."
      )
    ).toBeInTheDocument();
  });

  test("shows an error when profile loading fails", async () => {
    getProfile.mockRejectedValue(
      new Error("Unable to load profile.")
    );

    render(<Profile />);

    expect(
      await screen.findByText(
        "Unable to load profile."
      )
    ).toBeInTheDocument();
  });

  test("shows an error when profile update fails", async () => {
    const user = userEvent.setup();

    updateProfile.mockRejectedValue(
      new Error("Email address already exists.")
    );

    render(<Profile />);

    await screen.findByLabelText("Email");

    await user.click(
      screen.getByRole("button", {
        name: "Save Profile",
      })
    );

    expect(
      await screen.findByText(
        "Email address already exists."
      )
    ).toBeInTheDocument();
  });

  test("changes the user's password", async () => {
    const user = userEvent.setup();

    changePassword.mockResolvedValue({
      success: true,
      message: "Password changed successfully.",
    });

    render(<Profile />);

    await screen.findByLabelText(
      "Current password"
    );

    await user.type(
      screen.getByLabelText(
        "Current password"
      ),
      "Password123"
    );

    await user.type(
      screen.getByLabelText("New password"),
      "NewPassword456"
    );

    await user.type(
      screen.getByLabelText(
        "Confirm new password"
      ),
      "NewPassword456"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Change Password",
      })
    );

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        currentPassword: "Password123",
        newPassword: "NewPassword456",
      });
    });

    expect(
      await screen.findByText(
        "Password changed successfully."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Current password"
      )
    ).toHaveValue("");

    expect(
      screen.getByLabelText("New password")
    ).toHaveValue("");

    expect(
      screen.getByLabelText(
        "Confirm new password"
      )
    ).toHaveValue("");
  });

  test("rejects mismatched password confirmation", async () => {
    const user = userEvent.setup();

    render(<Profile />);

    await screen.findByLabelText(
      "Current password"
    );

    await user.type(
      screen.getByLabelText(
        "Current password"
      ),
      "Password123"
    );

    await user.type(
      screen.getByLabelText("New password"),
      "NewPassword456"
    );

    await user.type(
      screen.getByLabelText(
        "Confirm new password"
      ),
      "DifferentPassword456"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Change Password",
      })
    );

    expect(
      screen.getByText(
        "New password and confirmation do not match."
      )
    ).toBeInTheDocument();

    expect(changePassword).not.toHaveBeenCalled();
  });

  test("shows an error when password change fails", async () => {
    const user = userEvent.setup();

    changePassword.mockRejectedValue(
      new Error(
        "Current password is incorrect."
      )
    );

    render(<Profile />);

    await screen.findByLabelText(
      "Current password"
    );

    await user.type(
      screen.getByLabelText(
        "Current password"
      ),
      "WrongPassword123"
    );

    await user.type(
      screen.getByLabelText("New password"),
      "NewPassword456"
    );

    await user.type(
      screen.getByLabelText(
        "Confirm new password"
      ),
      "NewPassword456"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Change Password",
      })
    );

    expect(
      await screen.findByText(
        "Current password is incorrect."
      )
    ).toBeInTheDocument();
  });
});