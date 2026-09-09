import { useEffect, useState } from "react";

import {
  getTaxSettings,
  updateTaxSetting,
} from "../../api/taxApi";

function TaxSettingsSection({
  selectedYear,
  onYearChange,
  onSettingSaved,
}) {
  const [settings, setSettings] = useState([]);
  const [draftRates, setDraftRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTaxSettings();

        setSettings(response.data);
      } catch (err) {
        setError(
          err.message || "Failed to load tax settings"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const selectedSetting = settings.find(
  (setting) => setting.year === selectedYear
);

const taxRate =
  draftRates[selectedYear] ??
  (selectedSetting
    ? String(selectedSetting.taxRate)
    : "");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await updateTaxSetting({
        year: selectedYear,
        taxRate: Number(taxRate),
      });

      const savedSetting = response.data;

      setSettings((currentSettings) => {
        const exists = currentSettings.some(
          (setting) =>
            setting.year === savedSetting.year
        );

        if (exists) {
          return currentSettings.map((setting) =>
            setting.year === savedSetting.year
              ? savedSetting
              : setting
          );
        }

        return [
          savedSetting,
          ...currentSettings,
        ].sort((a, b) => b.year - a.year);
      });

      setDraftRates((current) => {
        const next = { ...current };
        delete next[selectedYear];
        return next;
      });

      onSettingSaved();

      setMessage("Tax setting saved successfully.");
    } catch (err) {
      setError(
        err.message || "Failed to save tax setting"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <p className="text-gray-600">
          Loading tax settings...
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border bg-white p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Tax Settings
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Select a tax year and save the estimated
          tax percentage you want to use.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        <div>
          <label
            htmlFor="tax-year"
            className="mb-1 block text-sm font-medium"
          >
            Tax Year
          </label>

          <input
            id="tax-year"
            type="number"
            min="2000"
            max="2100"
            value={selectedYear}
            onChange={(event) => {
              onYearChange(
                Number(event.target.value)
              );
              setMessage("");
            }}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="tax-rate"
            className="mb-1 block text-sm font-medium"
          >
            Tax Rate (%)
          </label>

          <input
            id="tax-rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(event) => {
              const value = event.target.value;

              setDraftRates((current) => ({
                ...current,
                [selectedYear]: value,
              }));

              setMessage("");
            }}
            placeholder="Example: 15.5"
            className="w-full rounded-md border px-3 py-2"
            required
          />

          <p className="mt-1 text-sm text-gray-500">
            Example: enter 15.5 for 15.5%.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="text-sm text-green-600">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : "Save Tax Setting"}
        </button>
      </form>
    </section>
  );
}

export default TaxSettingsSection;