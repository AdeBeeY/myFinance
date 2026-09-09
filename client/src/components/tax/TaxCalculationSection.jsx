import { useState } from "react";

import {
  calculateTax,
  getTaxSummary,
} from "../../api/taxApi";

import { formatCurrency } from "../../utils/currency";

function TaxCalculationSection({
  selectedYear,
  currency,
}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError("");

      await calculateTax(selectedYear);

      const response =
        await getTaxSummary(selectedYear);

      setSummary(response.data);
    } catch (err) {
      setSummary(null);
      setError(
        err.message ||
          "Failed to calculate estimated tax"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border bg-white p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Estimated Tax
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Calculate your estimated tax using your
          saved tax rate and transactions for{" "}
          {selectedYear}.
        </p>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={loading}
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Calculating..."
          : "Calculate Estimated Tax"}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {summary && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryItem
            label="Total Income"
            value={formatCurrency(
              summary.totalIncome,
              currency
            )}
          />

          <SummaryItem
            label="Total Expenses"
            value={formatCurrency(
              summary.totalExpense,
              currency
            )}
          />

          <SummaryItem
            label="Taxable Income"
            value={formatCurrency(
              summary.taxableIncome,
              currency
            )}
          />

          <SummaryItem
            label="Tax Rate"
            value={`${summary.taxRate}%`}
          />

          <SummaryItem
            label="Estimated Tax"
            value={formatCurrency(
              summary.estimatedTax,
              currency
            )}
          />

          <SummaryItem
            label="Tax Year"
            value={summary.year}
          />
        </div>
      )}
    </section>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}

export default TaxCalculationSection;