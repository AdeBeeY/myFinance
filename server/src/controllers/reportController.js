const reportService = require("../services/reportService");
const apiResponse = require("../helpers/apiResponse");
const asyncHandler = require("../helpers/asyncHandler");

const getDashboardSummary = asyncHandler(
  async (req, res) => {
    const summary =
      await reportService.getDashboardSummary(
        req.user.id
      );

    return res.status(200).json(
      apiResponse(
        true,
        "Dashboard summary retrieved successfully.",
        summary
      )
    );
  }
);

const getMonthlyReport = asyncHandler(
  async (req, res) => {
    const { year, month } = req.query;

    const report =
      await reportService.getMonthlyReport(
        req.user.id,
        year,
        month
      );

    return res.status(200).json(
      apiResponse(
        true,
        "Monthly report retrieved successfully.",
        report
      )
    );
  }
);

const getCategorySpendingReport = asyncHandler(
  async (req, res) => {
    const { year, month } = req.query;

    const report =
      await reportService.getCategorySpendingReport(
        req.user.id,
        year,
        month
      );

    return res.status(200).json(
      apiResponse(
        true,
        "Category spending report retrieved successfully.",
        report
      )
    );
  }
);

module.exports = {
  getDashboardSummary,
  getMonthlyReport,
  getCategorySpendingReport,
};