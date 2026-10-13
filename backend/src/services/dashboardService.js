const dashboardRepository = require("../repositories/dashboardRepository");
const pagination = require("../utils/pagination");
const AppError = require("../utils/appError");

const getDashboard = async (query = {}) => {
  const paging = pagination(query);
  try {
    return await dashboardRepository.getDashboardCounts(paging);
  } catch {
    throw new AppError("Dashboard operation failed", 500);
  }
};
module.exports = { getDashboard };
