const asyncHandler = require("../helpers/asyncHandler");
const apiResponse = require("../helpers/apiResponse");
const {
  getTaxSettings,
  upsertTaxSetting,
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

module.exports = {
  getSettings,
  updateSettings,
};