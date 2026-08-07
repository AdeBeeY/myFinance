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

const getDateRangeReport = asyncHandler(
  async (req, res) => {
    const { startDate, endDate } = req.query;

    const report =
      await reportService.getDateRangeReport(
        req.user.id,
        startDate,
        endDate
      );

    return res.status(200).json(
      apiResponse(
        true,
        "Date range report retrieved successfully.",
        report
      )
    );
  }
);

const getMonthlyTrends = asyncHandler(
  async (req, res) => {
    const { year } = req.query;

    const trends =
      await reportService.getMonthlyTrends(
        req.user.id,
        year
      );

    return res.status(200).json(
      apiResponse(
        true,
        "Monthly trends retrieved successfully.",
        trends
      )
    );
  }
);

const getCashFlowAnalysis = asyncHandler(
  async (req, res) => {
    const { year } = req.query;

    const cashFlow =
      await reportService.getCashFlowAnalysis(
        req.user.id,
        year
      );

    return res.status(200).json(
      apiResponse(
        true,
        "Cash flow analysis retrieved successfully.",
        cashFlow
      )
    );
  }
);

module.exports = {
  getDashboardSummary,
  getMonthlyReport,
  getCategorySpendingReport,
  getDateRangeReport,
  getMonthlyTrends,
  getCashFlowAnalysis,
};