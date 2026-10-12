const authService = require("../services/authService");
const handleControllerError = require("../utils/controllerError");

const login = async (req, res) => {
  try {
    const session = await authService.login(req.body);

    res.status(200).json({
      message: "Login successful",
      data: session,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.userId);

    res.status(200).json({
      message: "Profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const logout = async (req, res) => {
  try {
    const result = await authService.logout();

    res.status(200).json({
      message: "Logout successful",
      data: result,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

module.exports = {
  login,
  getProfile,
  logout,
};
