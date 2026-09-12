import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { MemoryRouter } from "react-router-dom";

import Transactions from "../pages/Transactions";

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactionApi";

import { getAccounts } from "../api/accountApi";
import { getCategories } from "../api/categoryApi";
import { getCurrentUser } from "../utils/auth";

vi.mock("../api/transactionApi", () => ({
  getTransactions: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}));

vi.mock("../api/accountApi", () => ({
  getAccounts: vi.fn(),
}));

vi.mock("../api/categoryApi", () => ({
  getCategories: vi.fn(),
}));

vi.mock("../utils/auth", () => ({
  getCurrentUser: vi.fn(),
}));

const account = {
  id: "account-1",
  name: "Main Account",
};

const expenseCategory = {
  id: "category-1",
  name: "Food",
  type: "EXPENSE",
};

const incomeCategory = {
  id: "category-2",
  name: "Salary",
  type: "INCOME",
};

const transaction = {
  id: "transaction-1",
  amount: 25000,
  type: "EXPENSE",
  description: "Weekly groceries",
  transactionDate: "2026-09-10T00:00:00.000Z",
  account,
  category: expenseCategory,
};

const successfulTransactionResponse = {
  data: {
    transactions: [transaction],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  },
};

describe("Transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getCurrentUser.mockReturnValue({
      firstName: "Joe",
      lastName: "Doe",
      currency: "NGN",
    });

    getAccounts.mockResolvedValue({
      data: [account],
    });

    getCategories.mockResolvedValue({
      data: [
        expenseCategory,
        incomeCategory,
      ],
    });
  });

  test("loads and displays transactions with pagination summary", async () => {
    getTransactions.mockResolvedValue(
      successfulTransactionResponse
    );

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Loading transactions...")
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: "Transactions",
      })
    ).toBeInTheDocument();

    expect(
      getTransactions
    ).toHaveBeenCalledTimes(1);

    const queryString =
      getTransactions.mock.calls[0][0];

    expect(queryString).toContain("page=1");
    expect(queryString).toContain("limit=10");
    expect(queryString).toContain(
      "sort=date_desc"
    );

    expect(
      screen.getByRole("heading", {
        name: "Food",
      })
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Main Account")
    ).toHaveLength(2);

    expect(
      screen.getByText("-₦25,000.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("EXPENSE")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Weekly groceries")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "1 transaction found"
      )
    ).toBeInTheDocument();

    const detailsLink =
      screen.getByRole("link", {
        name: "View Details",
      });

    expect(detailsLink).toHaveAttribute(
      "href",
      "/transactions/transaction-1"
    );
  });

  test("shows the empty state when there are no transactions", async () => {
    getTransactions.mockResolvedValue({
      data: {
        transactions: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      },
    });

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        "No transactions yet"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Add your first transaction using the form above."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "0 transactions found"
      )
    ).toBeInTheDocument();
  });

  test("shows an error when transactions cannot be loaded", async () => {
    getTransactions.mockRejectedValue(
      new Error(
        "Unable to retrieve transactions"
      )
    );

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        "Unable to retrieve transactions"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Transactions",
      })
    ).not.toBeInTheDocument();
  });

  test("applies transaction filters to the API query", async () => {
    const user = userEvent.setup();

    getTransactions.mockResolvedValue(
      successfulTransactionResponse
    );

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    await screen.findByRole("heading", {
      name: "Transactions",
    });

    // Search input accessible via label
    fireEvent.change(
      screen.getByLabelText("Search transactions"),
      {
        target: {
          value: "groceries",
        },
      }
    );

    await waitFor(() => {
      const calls = getTransactions.mock.calls;
      const lastQuery =
        calls[calls.length - 1][0];

      expect(lastQuery).toContain(
        "search=groceries"
      );
    });

    await screen.findByRole("heading", {
      name: "Transactions",
    });

    // Type filter select accessible via label
    const typeSelect = screen.getByLabelText("Filter by type");

    await user.selectOptions(
      typeSelect,
      "EXPENSE"
    );

    await waitFor(() => {
      const calls = getTransactions.mock.calls;
      const lastQuery =
        calls[calls.length - 1][0];

      expect(lastQuery).toContain(
        "type=EXPENSE"
      );
    });

    await screen.findByRole("heading", {
      name: "Transactions",
    });

    // Category filter select accessible via label
    const categorySelect = screen.getByLabelText("Filter by category");

    await user.selectOptions(
      categorySelect,
      "category-1"
    );

    await waitFor(() => {
      const calls = getTransactions.mock.calls;
      const lastQuery =
        calls[calls.length - 1][0];

      expect(lastQuery).toContain(
        "categoryId=category-1"
      );
    });

    await screen.findByRole("heading", {
      name: "Transactions",
    });

    // Account filter select accessible via label
    const accountSelect = screen.getByLabelText("Filter by account");

    await user.selectOptions(
      accountSelect,
      "account-1"
    );

    await waitFor(() => {
      const calls = getTransactions.mock.calls;
      const lastQuery =
        calls[calls.length - 1][0];

      expect(lastQuery).toContain(
        "search=groceries"
      );

      expect(lastQuery).toContain(
        "type=EXPENSE"
      );

      expect(lastQuery).toContain(
        "categoryId=category-1"
      );

      expect(lastQuery).toContain(
        "accountId=account-1"
      );

      expect(lastQuery).toContain(
        "page=1"
      );
    });
  });

  test("updates the transaction sort order", async () => {
    const user = userEvent.setup();

    getTransactions.mockResolvedValue(
      successfulTransactionResponse
    );

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    await screen.findByRole("heading", {
      name: "Transactions",
    });

    // Sort select accessible via label
    const sortSelect = screen.getByLabelText("Sort transactions");

    await user.selectOptions(
      sortSelect,
      "amount_desc"
    );

    await waitFor(() => {
      const calls =
        getTransactions.mock.calls;

      const lastQuery =
        calls[calls.length - 1][0];

      expect(lastQuery).toContain(
        "sort=amount_desc"
      );

      expect(lastQuery).toContain(
        "page=1"
      );

      expect(lastQuery).toContain(
        "limit=10"
      );
    });
  });

  test("loads the next page of transactions", async () => {
    const user = userEvent.setup();

    getTransactions.mockImplementation(
      async (queryString) => {
        const params =
          new URLSearchParams(queryString);

        const requestedPage =
          Number(params.get("page"));

        return {
          data: {
            transactions: [transaction],
            pagination: {
              page: requestedPage,
              limit: 10,
              total: 15,
              totalPages: 2,
            },
          },
        };
      }
    );

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        "Page 1 of 2"
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Next",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Page 2 of 2"
        )
      ).toBeInTheDocument();
    });

    const calls =
      getTransactions.mock.calls;

    const lastQuery =
      calls[calls.length - 1][0];

    expect(lastQuery).toContain(
      "page=2"
    );

    expect(lastQuery).toContain(
      "limit=10"
    );

    expect(lastQuery).toContain(
      "sort=date_desc"
    );
  });

  test("creates a transaction and refreshes the list", async () => {
    const user = userEvent.setup();

    getTransactions
      .mockResolvedValueOnce({
        data: {
          transactions: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
      })
      .mockResolvedValue({
        data: {
          transactions: [transaction],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        },
      });

    createTransaction.mockResolvedValue({
      data: transaction,
    });

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    await screen.findByText(
      "No transactions yet"
    );

    await user.click(
      screen.getByRole("button", {
        name: "+ Add Transaction",
      })
    );

    const formHeading =
      screen.getByRole("heading", {
        name: "Add Transaction",
      });

    const form = formHeading.closest("form");

    expect(form).not.toBeNull();

    const typeSelect =
      within(form).getByLabelText("Type");

    const amountInput =
      within(form).getByLabelText("Amount");

    const accountSelect =
      within(form).getByLabelText("Account");

    const categorySelect =
      within(form).getByLabelText("Category");

    const dateInput =
      within(form).getByLabelText("Date");

    const descriptionInput =
      within(form).getByLabelText("Description");

    await user.selectOptions(
      typeSelect,
      "EXPENSE"
    );

    await user.type(
      amountInput,
      "25000"
    );

    await user.selectOptions(
      accountSelect,
      "account-1"
    );

    await user.selectOptions(
      categorySelect,
      "category-1"
    );

    fireEvent.change(dateInput, {
      target: {
        value: "2026-09-10",
      },
    });

    await user.type(
      descriptionInput,
      "Weekly groceries"
    );

    await user.click(
      within(form).getByRole("button", {
        name: "Add Transaction",
      })
    );

    await waitFor(() => {
      expect(createTransaction)
        .toHaveBeenCalledWith({
          amount: "25000",
          type: "EXPENSE",
          description:
            "Weekly groceries",
          transactionDate:
            "2026-09-10",
          categoryId: "category-1",
          accountId: "account-1",
        });
    });

    await waitFor(() => {
      expect(getTransactions)
        .toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText(
        "Weekly groceries"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Add Transaction",
      })
    ).not.toBeInTheDocument();
  });

  test("edits a transaction and refreshes the list", async () => {
    const user = userEvent.setup();

    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});

    const updatedTransaction = {
      ...transaction,
      amount: 30000,
      description: "Updated groceries",
    };

    getTransactions
      .mockResolvedValueOnce(
        successfulTransactionResponse
      )
      .mockResolvedValue({
        data: {
          transactions: [
            updatedTransaction,
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        },
      });

    updateTransaction.mockResolvedValue({
      data: updatedTransaction,
    });

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    await screen.findByText(
      "Weekly groceries"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Edit",
      })
    );

    expect(scrollToSpy)
      .toHaveBeenCalledWith({
        top: 0,
        behavior: "smooth",
      });

    const formHeading =
      screen.getByRole("heading", {
        name: "Edit Transaction",
      });

    const form = formHeading.closest("form");

    expect(form).not.toBeNull();

    const amountInput =
      within(form).getByLabelText("Amount");

    const descriptionInput =
      within(form).getByLabelText("Description");

    expect(amountInput).toHaveValue(25000);

    expect(descriptionInput).toHaveValue(
      "Weekly groceries"
    );

    await user.clear(amountInput);
    await user.type(
      amountInput,
      "30000"
    );

    await user.clear(descriptionInput);
    await user.type(
      descriptionInput,
      "Updated groceries"
    );

    await user.click(
      within(form).getByRole("button", {
        name: "Update Transaction",
      })
    );

    await waitFor(() => {
      expect(updateTransaction)
        .toHaveBeenCalledWith(
          "transaction-1",
          {
            amount: "30000",
            type: "EXPENSE",
            description:
              "Updated groceries",
            transactionDate:
              "2026-09-10",
            categoryId: "category-1",
            accountId: "account-1",
          }
        );
    });

    await waitFor(() => {
      expect(getTransactions)
        .toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText(
        "Updated groceries"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("-₦30,000.00")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Edit Transaction",
      })
    ).not.toBeInTheDocument();

    scrollToSpy.mockRestore();
  });

  test("deletes a transaction after confirmation and refreshes the list", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    getTransactions
      .mockResolvedValueOnce(
        successfulTransactionResponse
      )
      .mockResolvedValue({
        data: {
          transactions: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
      });

    deleteTransaction.mockResolvedValue({
      success: true,
    });

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    await screen.findByText(
      "Weekly groceries"
    );

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

    await waitFor(() => {
      expect(getTransactions)
        .toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText(
        "No transactions yet"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Weekly groceries"
      )
    ).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test("does not delete a transaction when confirmation is cancelled", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(false);

    getTransactions.mockResolvedValue(
      successfulTransactionResponse
    );

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    await screen.findByText(
      "Weekly groceries"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(confirmSpy)
      .toHaveBeenCalledWith(
        "Are you sure you want to delete this transaction?"
      );

    expect(deleteTransaction)
      .not.toHaveBeenCalled();

    expect(getTransactions)
      .toHaveBeenCalledTimes(1);

    expect(
      screen.getByText(
        "Weekly groceries"
      )
    ).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test("shows an error when deleting a transaction fails", async () => {
    const user = userEvent.setup();

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);

    getTransactions.mockResolvedValue(
      successfulTransactionResponse
    );

    deleteTransaction.mockRejectedValue(
      new Error(
        "Unable to delete this transaction"
      )
    );

    render(
      <MemoryRouter>
        <Transactions />
      </MemoryRouter>
    );

    await screen.findByText(
      "Weekly groceries"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(
      await screen.findByText(
        "Unable to delete this transaction"
      )
    ).toBeInTheDocument();

    expect(deleteTransaction)
      .toHaveBeenCalledWith(
        "transaction-1"
      );

    // A failed deletion must not refresh
    // the transaction list.
    expect(getTransactions)
      .toHaveBeenCalledTimes(1);

    expect(
      screen.getByText(
        "Weekly groceries"
      )
    ).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});