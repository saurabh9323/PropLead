const dashboardRepository = require("../repositories/dashboardRepository");
const AppError = require("../utils/appError");

const handleDashboardRepositoryError = () => {
  throw new AppError("Dashboard operation failed", 500);
};

const getDashboard = async () => {
  try {
    const dashboardCounts = await dashboardRepository.getDashboardCounts();
    const totalLeads = dashboardCounts.totalLeads;
    const conversionRate =
      totalLeads === 0 ? 0 : Number(((dashboardCounts.closedLeads / totalLeads) * 100).toFixed(2));

    return {
      totalLeads,
      leadsBySource: dashboardCounts.leadsBySource,
      conversionRate,
      statusDistribution: dashboardCounts.statusDistribution,
    };
  } catch (error) {
    handleDashboardRepositoryError(error);
  }
};

module.exports = {
  getDashboard,
};
