import { getCurrentUser } from "../utils/auth";

import MonthlyReportSection from "../components/reports/MonthlyReportSection";
import RankingsSection from "../components/reports/RankingsSection";
import DateRangeReportSection from "../components/reports/DateRangeReportSection";
import CategorySpendingSection from "../components/reports/CategorySpendingSection";
import MonthlyTrendsSection from "../components/reports/MonthlyTrendsSection";
import CashFlowSavingsSection from "../components/reports/CashFlowSavingsSection";

function Reports() {
  const user = getCurrentUser();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="mt-2 text-gray-600">
          Analyze your income, expenses, savings, spending patterns, and financial trends.
        </p>
      </div>

      {/* Monthly Report Section */}
      <MonthlyReportSection
        currency={user?.currency}
      />

      {/* Date Range Report Section */}
      <DateRangeReportSection
        currency={user?.currency}
      />

      {/* Monthly Trends Section */}
      <MonthlyTrendsSection
        currency={user?.currency}
      />

      {/* Category Spending Section */}
      <CategorySpendingSection
        currency={user?.currency}
      />

      {/* Cash Flow & Savings Section */}
      <CashFlowSavingsSection
        currency={user?.currency}
      />

      {/* Top Spending + Largest Transactions Section */}
      <RankingsSection
        currency={user?.currency}
      />
    </div>
  );
}

export default Reports;