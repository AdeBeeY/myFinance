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

import {
  MemoryRouter,
} from "react-router-dom";

import Dashboard from "../pages/Dashboard";

import {
  getDashboardSummary,
  getExpenseBreakdown,
  getFinancialHealth,
  getMonthlyTrends,
} from "../api/reportApi";

import {
  getAccounts,
} from "../api/accountApi";

import {
  getTaxSummary,
} from "../api/taxApi";

vi.mock("../api/reportApi", () => ({
  getDashboardSummary: vi.fn(),
  getExpenseBreakdown: vi.fn(),
  getFinancialHealth: vi.fn(),
  getMonthlyTrends: vi.fn(),
}));

vi.mock("../api/accountApi", () => ({
  getAccounts: vi.fn(),
}));

vi.mock("../api/taxApi", () => ({
  getTaxSummary: vi.fn(),
}));

vi.mock("../utils/auth", () => ({
  getCurrentUser: vi.fn(() => ({
    id: "test-user-id",
    firstName: "Joe",
    lastName: "Doe",
    currency: "NGN",
  })),
  logout: vi.fn(),
}));

vi.mock(
  "../components/dashboard/SummaryCards",
  () => ({
    default: ({ summary, currency }) => (
      <div>
        Summary:
        {summary.currentBalance}-
        {currency}
      </div>
    ),
  })
);

vi.mock(
  "../components/dashboard/AccountBalances",
  () => ({
    default: ({ accounts, currency }) => (
      <div>
        Accounts:
        {accounts.length}-
        {currency}
      </div>
    ),
  })
);

vi.mock(
  "../components/dashboard/FinancialHealth",
  () => ({
    default: ({ health }) => (
      <div>
        Financial Health:
        {health.status}
      </div>
    ),
  })
);

vi.mock(
  "../components/dashboard/ExpenseBreakdown",
  () => ({
    default: ({ expenses }) => (
      <div>
        Expenses:
        {expenses.length}
      </div>
    ),
  })
);

vi.mock(
  "../components/dashboard/RecentTransactions",
  () => ({
    default: ({ transactions }) => (
      <div>
        Recent Transactions:
        {transactions.length}
      </div>
    ),
  })
);

vi.mock(
  "../components/dashboard/EstimatedTax",
  () => ({
    default: ({
      taxSummary,
      taxError,
      currency,
      year,
    }) => (
      <div>
        Tax:
        {taxSummary
          ? taxSummary.estimatedTax
          : "none"}
        -
        {taxError || "no-error"}
        -
        {currency}
        -
        {year}
      </div>
    ),
  })
);

const dashboardData = {
  summary: {
    currentBalance: 370000,
    totalIncome: 500000,
    totalExpense: 130000,
    totalAccounts: 2,
    totalCategories: 5,
    totalTransactions: 4,
  },
  recentTransactions: [
    { id: "transaction-1" },
    { id: "transaction-2" },
  ],
};

const mockSuccessfulCoreRequests = () => {
  getDashboardSummary.mockResolvedValue({
    data: dashboardData,
  });

  getAccounts.mockResolvedValue({
    data: [
      { id: "account-1" },
      { id: "account-2" },
    ],
  });

  getFinancialHealth.mockResolvedValue({
    data: {
      status: "HEALTHY",
    },
  });

  getExpenseBreakdown.mockResolvedValue({
    data: [
      { category: "Food" },
      { category: "Transport" },
    ],
  });
};

const monthlyTrendsData = Array.from(
  { length: 12 },
  (_, index) => ({
    month: index + 1,
    income: index === 0 ? 150000 : 0,
    expense: index === 0 ? 50000 : 0,
  })
);

const renderDashboard = () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getMonthlyTrends.mockResolvedValue({
      success: true,
      data: monthlyTrendsData,
    });
  });

  test("shows loading state while dashboard data is loading", () => {
    getDashboardSummary.mockImplementation(
      () => new Promise(() => {})
    );

    getAccounts.mockResolvedValue({
      data: [],
    });

    getFinancialHealth.mockResolvedValue({
      data: null,
    });

    getExpenseBreakdown.mockResolvedValue({
      data: [],
    });

    renderDashboard();

    expect(
      screen.getByText("Loading dashboard...")
    ).toBeInTheDocument();
  });

  test("loads and renders dashboard data successfully", async () => {
    mockSuccessfulCoreRequests();

    getTaxSummary.mockResolvedValue({
      data: {
        estimatedTax: 37000,
        taxRate: 10,
      },
    });

    renderDashboard();

    expect(
      await screen.findByRole("heading", {
        name: "Dashboard",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Summary:370000-NGN"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Accounts:2-NGN"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Financial Health:HEALTHY"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Expenses:2")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Recent Transactions:2"
      )
    ).toBeInTheDocument();

    expect(getDashboardSummary)
      .toHaveBeenCalledTimes(1);

    expect(getAccounts)
      .toHaveBeenCalledTimes(1);

    expect(getFinancialHealth)
      .toHaveBeenCalledTimes(1);

    expect(getExpenseBreakdown)
      .toHaveBeenCalledTimes(1);

    expect(getTaxSummary)
      .toHaveBeenCalledWith(
        new Date().getFullYear()
      );
  });

  test("shows the main error when a core dashboard request fails", async () => {
    getDashboardSummary.mockRejectedValue(
      new Error("Failed to load dashboard")
    );

    getAccounts.mockResolvedValue({
      data: [],
    });

    getFinancialHealth.mockResolvedValue({
      data: null,
    });

    getExpenseBreakdown.mockResolvedValue({
      data: [],
    });

    renderDashboard();

    expect(
      await screen.findByText(
        "Failed to load dashboard"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Dashboard",
      })
    ).not.toBeInTheDocument();

    expect(getTaxSummary)
      .not.toHaveBeenCalled();
  });

  test("treats a missing tax setting as not configured", async () => {
    mockSuccessfulCoreRequests();

    getTaxSummary.mockRejectedValue(
      Object.assign(
        new Error(
          "No tax setting found for current year"
        ),
        {
          status: 404,
        }
      )
    );

    renderDashboard();

    expect(
      await screen.findByRole("heading", {
        name: "Dashboard",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Tax:none-no-error-NGN-/
      )
    ).toBeInTheDocument();
  });

  test("keeps the dashboard usable when tax loading fails", async () => {
    mockSuccessfulCoreRequests();

    getTaxSummary.mockRejectedValue(
      Object.assign(
        new Error("Tax service unavailable"),
        {
          status: 500,
        }
      )
    );

    renderDashboard();

    expect(
      await screen.findByRole("heading", {
        name: "Dashboard",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Tax:none-Tax service unavailable-NGN-/
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Summary:370000-NGN"
      )
    ).toBeInTheDocument();
  });
});