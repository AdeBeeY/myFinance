import apiClient from "./apiClient";

export const getTaxSettings = async () =>
  apiClient("/tax/settings");

export const updateTaxSetting = async (taxSettingData) =>
  apiClient("/tax/settings", {
    method: "PUT",
    body: JSON.stringify(taxSettingData),
  });

export const calculateTax = async (year) =>
  apiClient("/tax/calculate", {
    method: "POST",
    body: JSON.stringify({ year }),
  });

export const getTaxSummary = async (year) => {
  const params = new URLSearchParams({
    year: String(year),
  });

  return apiClient(
    `/tax/summary?${params.toString()}`,
    {
      cache: "no-store",
    }
  );
};