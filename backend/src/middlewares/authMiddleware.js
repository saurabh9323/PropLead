const AppError = require("../utils/appError");
const handleControllerError = require("../utils/controllerError");
const { verifyToken } = require("../utils/jwt");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required", 401);
    }

    const token = authHeader.split(" ")[1];
    req.user = verifyToken(token);
    next();
  } catch (error) {
    handleControllerError(res, error);
  }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError("Access denied", 403);
    }

    next();
  } catch (error) {
    handleControllerError(res, error);
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
