import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getExpenseBreakdown,
  getFinancialHealth,
  getMonthlyTrends,
} from "../api/reportApi";
import { getAccounts } from "../api/accountApi";
import SummaryCards from "../components/dashboard/SummaryCards";
import AccountBalances from "../components/dashboard/AccountBalances";
import FinancialHealth from "../components/dashboard/FinancialHealth";
import ExpenseBreakdown from "../components/dashboard/ExpenseBreakdown";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import {
  getCurrentUser,
  logout,
} from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { getTaxSummary } from "../api/taxApi";
import EstimatedTax from "../components/dashboard/EstimatedTax";
import MonthlyIncomeChart from "../components/dashboard/MonthlyIncomeChart";
import MonthlyExpenseChart from "../components/dashboard/MonthlyExpenseChart";
import IncomeExpenseChart from "../components/dashboard/IncomeExpenseChart";
import CategoryDistributionChart from "../components/dashboard/CategoryDistributionChart";

function Dashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [financialHealth, setFinancialHealth] = useState(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [taxSummary, setTaxSummary] = useState(null);
  const [taxError, setTaxError] = useState("");
  const [monthlyTrends, setMonthlyTrends] =
  useState([]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError("");

        const currentYear = new Date().getFullYear();

        const [
          dashboardResponse,
          accountsResponse,
          financialHealthResponse,
          expenseBreakdownResponse,
          monthlyTrendsResponse,
        ] = await Promise.all([
          getDashboardSummary(),
          getAccounts(),
          getFinancialHealth(),
          getExpenseBreakdown(),
          getMonthlyTrends(currentYear),
        ]);

        setDashboard(dashboardResponse.data);
        setAccounts(accountsResponse.data);
        setFinancialHealth(
          financialHealthResponse.data
        );
        setExpenseBreakdown(
          expenseBreakdownResponse.data
        );
        setMonthlyTrends(
          monthlyTrendsResponse.data
        );

      try {
        setTaxError("");

        const taxResponse =
          await getTaxSummary(currentYear);

        setTaxSummary(taxResponse.data);
      } catch (error) {
        setTaxSummary(null);

        if (error.status === 404) {
          setTaxError("");
        } else {
          setTaxError(
            error.message ||
              "Failed to load estimated tax"
          );
        }
      }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <button
        type="button"
        onClick={handleLogout}
        className="border px-4 py-2"
      >
        Logout
      </button>

      <SummaryCards
        summary={dashboard.summary}
        currency={user?.currency}
      />

      <EstimatedTax
        taxSummary={taxSummary}
        taxError={taxError}
        currency={user?.currency}
        year={new Date().getFullYear()}
      />

      <AccountBalances
        accounts={accounts}
        currency={user?.currency}
      />

      {financialHealth && (
        <FinancialHealth
          health={financialHealth}
          currency={user?.currency}
        />
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <MonthlyIncomeChart
          trends={monthlyTrends}
          currency={user?.currency}
          year={new Date().getFullYear()}
        />

        <MonthlyExpenseChart
          trends={monthlyTrends}
          currency={user?.currency}
          year={new Date().getFullYear()}
        />
      </div>

      <div className="mt-6">
        <IncomeExpenseChart
          trends={monthlyTrends}
          currency={user?.currency}
          year={new Date().getFullYear()}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <CategoryDistributionChart
          expenses={expenseBreakdown}
          currency={user?.currency}
        />

        <ExpenseBreakdown
          expenses={expenseBreakdown}
          currency={user?.currency}
        />
      </div>

      <RecentTransactions
        transactions={dashboard.recentTransactions}
        currency={user?.currency}
      />
    </div>
  );
}

export default Dashboard;