const AppError = require("./appError");

function integer(value, fallback, max, name) {
  if (value === undefined) return fallback;
  if (
    !["string", "number"].includes(typeof value) ||
    !/^[1-9]\d*$/.test(String(value)) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) > max
  ) {
    throw new AppError(`${name} must be an integer from 1 to ${max}`, 400);
  }
  return Number(value);
}

module.exports = function pagination(query = {}) {
  return {
    page: integer(query.page, 1, 2147483647, "Page"),
    pageSize: integer(query.pageSize, 10, 100, "Page size"),
  };
};
