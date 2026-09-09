import { Link } from "react-router-dom";

import { formatCurrency } from "../../utils/currency";

function EstimatedTax({
  taxSummary,
  taxError,
  currency,
  year,
}) {
  return (
    <section className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        
        <div>
          <p className="text-sm text-gray-600">
            Estimated Tax
          </p>

          {taxError ? (
            <>
              <p className="mt-2 text-lg font-semibold text-red-600">
                Unable to load estimate
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {taxError}
              </p>
            </>
          ) : taxSummary ? (
            <>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(
                  taxSummary.estimatedTax,
                  currency
                )}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {year} estimate at{" "}
                {taxSummary.taxRate}%
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-lg font-semibold">
                Not configured
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Add a tax rate for {year} to see
                your estimated tax.
              </p>
            </>
          )}
        </div>

        <Link
          to="/tax"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          {taxSummary
            ? "View tax calculator"
            : "Configure tax"}
        </Link>
      </div>
    </section>
  );
}

export default EstimatedTax;