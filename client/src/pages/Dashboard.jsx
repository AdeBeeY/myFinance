import { useEffect, useState } from "react";
import { getDashboardSummary } from "../api/reportApi";
import SummaryCards from "../components/dashboard/SummaryCards";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import { getCurrentUser } from "../utils/auth";

function Dashboard() {
  const user = getCurrentUser();

  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError("");

        const response = await getDashboardSummary();

        setDashboard(response.data);
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

      <SummaryCards
        summary={dashboard.summary}
        currency={user?.currency}
      />

      <RecentTransactions
        transactions={dashboard.recentTransactions}
        currency={user?.currency}
      />
    </div>
  );
}

export default Dashboard;