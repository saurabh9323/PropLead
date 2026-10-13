const dashboardService = require("../services/dashboardService");
const handleControllerError = require("../utils/controllerError");

const getDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardService.getDashboard(req.query);

    res.status(200).json(dashboard);
  } catch (error) {
    handleControllerError(res, error);
  }
};

module.exports = {
  getDashboard,
};
