import { useState } from "react";

import TaxSettingsSection from "../components/tax/TaxSettingsSection";
import TaxCalculationSection from "../components/tax/TaxCalculationSection";
import { getCurrentUser } from "../utils/auth";

function TaxCalculator() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [taxSettingsVersion, setTaxSettingsVersion] = useState(0);

  const user = getCurrentUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tax Calculator</h1>

        <p className="mt-2 text-gray-600">
          Configure your tax rate and calculate your estimated tax for a
          selected year.
        </p>
      </div>

      <TaxSettingsSection
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        onSettingSaved={() =>
          setTaxSettingsVersion((version) => version + 1)
        }
      />

      <TaxCalculationSection
        key={`${selectedYear}-${taxSettingsVersion}`}
        selectedYear={selectedYear}
        currency={user?.currency}
      />
    </div>
  );
}

export default TaxCalculator;