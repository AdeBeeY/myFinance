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
  within,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import Accounts from "../pages/Accounts";

import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "../api/accountApi";

import {
  getCurrentUser,
} from "../utils/auth";

vi.mock("../api/accountApi", () => ({
  getAccounts: vi.fn(),
  createAccount: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccount: vi.fn(),
}));

vi.mock("../utils/auth", () => ({
  getCurrentUser: vi.fn(),
}));

const checkingAccount = {
  id: "account-1",
  name: "Checking Account",
  description: "Main account",
  balance: 125000,
};

describe("Accounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getCurrentUser.mockReturnValue({
      firstName: "Joe",
      lastName: "Doe",
      currency: "NGN",
    });
  });

  test("loads and displays accounts with formatted balances", async () => {
    getAccounts.mockResolvedValue({
      data: [checkingAccount],
    });

    render(<Accounts />);

    expect(
      screen.getByText("Loading accounts...")
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Checking Account")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Main account")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Balance: ₦125,000.00")
    ).toBeInTheDocument();

    expect(getAccounts)
      .toHaveBeenCalledTimes(1);
  });

  test("creates a new account and adds it to the list", async () => {
    const user = userEvent.setup();

    getAccounts.mockResolvedValue({
      data: [],
    });

    createAccount.mockResolvedValue({
      data: {
        id: "account-2",
        name: "Savings Account",
        description: "Emergency savings",
        balance: 0,
      },
    });

    render(<Accounts />);

    await screen.findByRole("heading", {
      name: "My Accounts",
    });

    await user.type(
      screen.getByLabelText("Account Name"),
      "Savings Account"
    );

    await user.type(
      screen.getByLabelText("Description"),
      "Emergency savings"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Create Account",
      })
    );

    expect(createAccount)
      .toHaveBeenCalledWith({
        name: "Savings Account",
        description: "Emergency savings",
      });

    expect(
      await screen.findByText(
        "Account created successfully."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Savings Account")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Balance: ₦0.00")
    ).toBeInTheDocument();
  });

  test("edits and updates an existing account", async () => {
    const user = userEvent.setup();

    getAccounts.mockResolvedValue({
      data: [checkingAccount],
    });

    updateAccount.mockResolvedValue({
      data: {
        ...checkingAccount,
        name: "Primary Account",
        description: "Updated account",
      },
    });

    render(<Accounts />);

    const accountName =
      await screen.findByText(
        "Checking Account"
      );

    const accountCard =
      accountName.parentElement;

    await user.click(
      within(accountCard).getByRole(
        "button",
        {
          name: "Edit",
        }
      )
    );

    const editFormHeading =
      screen.getByRole("heading", {
        name: "Edit Account",
      });

    const editForm =
      editFormHeading.closest("form");

    const editName =
      within(editForm).getByLabelText(
        "Account Name"
      );

    const editDescription =
      within(editForm).getByLabelText(
        "Description"
      );

    await user.clear(editName);
    await user.type(
      editName,
      "Primary Account"
    );

    await user.clear(editDescription);
    await user.type(
      editDescription,
      "Updated account"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save Changes",
      })
    );

    expect(updateAccount)
      .toHaveBeenCalledWith(
        "account-1",
        {
          name: "Primary Account",
          description: "Updated account",
        }
      );

    expect(
      await screen.findByText(
        "Account updated successfully."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Primary Account")
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Checking Account"
      )
    ).not.toBeInTheDocument();
  });

  test("deletes an account after confirmation", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    getAccounts.mockResolvedValue({
      data: [checkingAccount],
    });

    deleteAccount.mockResolvedValue({
      success: true,
    });

    render(<Accounts />);

    const accountName =
      await screen.findByText(
        "Checking Account"
      );

    const accountCard =
      accountName.parentElement;

    await user.click(
      within(accountCard).getByRole(
        "button",
        {
          name: "Delete",
        }
      )
    );

    expect(confirmSpy)
      .toHaveBeenCalledWith(
        "Are you sure you want to delete this account?"
      );

    expect(deleteAccount)
      .toHaveBeenCalledWith("account-1");

    expect(
      await screen.findByText(
        "Account deleted successfully."
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Checking Account"
      )
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        "No accounts found."
      )
    ).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test("shows an error when accounts cannot be loaded", async () => {
    getAccounts.mockRejectedValue(
      new Error(
        "Unable to retrieve accounts"
      )
    );

    render(<Accounts />);

    expect(
      await screen.findByText(
        "Unable to retrieve accounts"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "My Accounts",
      })
    ).not.toBeInTheDocument();
  });
});