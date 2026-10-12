const dashboardService = require("../services/dashboardService");
const handleControllerError = require("../utils/controllerError");

const getDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardService.getDashboard();

    res.status(200).json({
      message: "Dashboard retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

module.exports = {
  getDashboard,
};
