const apiResponse = require("./apiResponse");
const handleControllerError = (res, error) => {
  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json(apiResponse(statusCode, statusCode === 500 ? "Internal server error" : error.message));
};

module.exports = handleControllerError;
