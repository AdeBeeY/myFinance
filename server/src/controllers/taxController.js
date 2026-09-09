const asyncHandler = require("../helpers/asyncHandler");
const apiResponse = require("../helpers/apiResponse");
const {
  getTaxSettings,
  upsertTaxSetting,
  calculateUserTaxForYear,
  getTaxSummary,
} = require("../services/taxService");

const getSettings = asyncHandler(async (req, res) => {
  const taxSettings = await getTaxSettings(req.user.id);

  return res.status(200).json(
    apiResponse(
      true,
      "Tax settings retrieved successfully",
      taxSettings
    )
  );
});

const updateSettings = asyncHandler(async (req, res) => {
  const { year, taxRate } = req.body;

  const taxSetting = await upsertTaxSetting(
    req.user.id,
    year,
    taxRate
  );

  return res.status(200).json(
    apiResponse(
      true,
      "Tax setting saved successfully",
      taxSetting
    )
  );
});

const calculateTax = asyncHandler(async (req, res) => {
  const { year } = req.body;

  const calculation =
    await calculateUserTaxForYear(
      req.user.id,
      year
    );

  if (!calculation) {
    return res.status(404).json(
      apiResponse(
        false,
        `No tax setting found for ${year}`,
        null
      )
    );
  }

  return res.status(200).json(
    apiResponse(
      true,
      "Tax calculated successfully",
      calculation
    )
  );
});

const getSummary = asyncHandler(async (req, res) => {
  const { year } = req.query;

  const summary = await getTaxSummary(
    req.user.id,
    year
  );

  if (!summary) {
    return res.status(404).json(
      apiResponse(
        false,
        `No tax setting found for ${year}`,
        null
      )
    );
  }

  return res.status(200).json(
    apiResponse(
      true,
      "Tax summary retrieved successfully",
      summary
    )
  );
});

module.exports = {
  getSettings,
  updateSettings,
  calculateTax,
  getSummary,
};