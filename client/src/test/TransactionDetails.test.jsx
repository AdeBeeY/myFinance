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

import TransactionDetails
  from "../pages/TransactionDetails";

import {
  deleteTransaction,
  getTransactionById,
} from "../api/transactionApi";

import { getCurrentUser }
  from "../utils/auth";

vi.mock("../api/transactionApi", () => ({
  getTransactionById: vi.fn(),
  deleteTransaction: vi.fn(),
}));

vi.mock("../utils/auth", () => ({
  getCurrentUser: vi.fn(),
}));

const transaction = {
  id: "transaction-1",
  amount: 25000,
  type: "EXPENSE",
  description: "Weekly groceries",
  transactionDate:
    "2026-09-10T00:00:00.000Z",
  createdAt:
    "2026-09-10T08:00:00.000Z",
  updatedAt:
    "2026-09-10T09:00:00.000Z",
  account: {
    id: "account-1",
    name: "Main Account",
  },
  category: {
    id: "category-1",
    name: "Food",
  },
};

const renderTransactionDetails = () => {
  return render(
    <MemoryRouter
      initialEntries={[
        "/transactions/transaction-1",
      ]}
    >
      <Routes>
        <Route
          path="/transactions/:transactionId"
          element={<TransactionDetails />}
        />

        <Route
          path="/transactions"
          element={
            <h1>Transactions Page</h1>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("TransactionDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getCurrentUser.mockReturnValue({
      firstName: "Joe",
      lastName: "Doe",
      currency: "NGN",
    });
  });

  test("loads and displays transaction details", async () => {
    getTransactionById.mockResolvedValue({
      data: transaction,
    });

    renderTransactionDetails();

    expect(
      screen.getByText(
        "Loading transaction..."
      )
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: "Transaction Details",
      })
    ).toBeInTheDocument();

    expect(getTransactionById)
      .toHaveBeenCalledWith(
        "transaction-1"
      );

    expect(
      screen.getByText("-₦25,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Main Account")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Food")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Weekly groceries"
      )
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("EXPENSE")
    ).toHaveLength(2);

    const backLinks =
      screen.getAllByRole("link");

    expect(
      backLinks.some(
        (link) =>
          link.getAttribute("href") ===
          "/transactions"
      )
    ).toBe(true);
  });

  test("shows an error when the transaction cannot be loaded", async () => {
    getTransactionById.mockRejectedValue(
      new Error(
        "Unable to retrieve transaction"
      )
    );

    renderTransactionDetails();

    expect(
      await screen.findByText(
        "Unable to retrieve transaction"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Back to Transactions",
      })
    ).toHaveAttribute(
      "href",
      "/transactions"
    );

    expect(
      screen.queryByRole("heading", {
        name: "Transaction Details",
      })
    ).not.toBeInTheDocument();
  });

  test("deletes the transaction and navigates back to transactions", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    getTransactionById.mockResolvedValue({
      data: transaction,
    });

    deleteTransaction.mockResolvedValue({
      success: true,
    });

    renderTransactionDetails();

    await screen.findByRole("heading", {
      name: "Transaction Details",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(confirmSpy)
      .toHaveBeenCalledWith(
        "Are you sure you want to delete this transaction?"
      );

    await waitFor(() => {
      expect(deleteTransaction)
        .toHaveBeenCalledWith(
          "transaction-1"
        );
    });

    expect(
      await screen.findByRole("heading", {
        name: "Transactions Page",
      })
    ).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test("shows an error when deleting the transaction fails", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    getTransactionById.mockResolvedValue({
      data: transaction,
    });

    deleteTransaction.mockRejectedValue(
      new Error(
        "Unable to delete transaction"
      )
    );

    renderTransactionDetails();

    await screen.findByRole("heading", {
      name: "Transaction Details",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(
      await screen.findByText(
        "Unable to delete transaction"
      )
    ).toBeInTheDocument();

    expect(deleteTransaction)
      .toHaveBeenCalledWith(
        "transaction-1"
      );

    // Failed deletion must leave the
    // user on the details page.
    expect(
      screen.getByRole("heading", {
        name: "Transaction Details",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Transactions Page",
      })
    ).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});