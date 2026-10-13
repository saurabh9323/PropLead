export function getPagination(params = {}) {
  const positiveInteger = (value, fallback, max) =>
    ["string", "number"].includes(typeof value) &&
    /^[1-9]\d*$/.test(String(value)) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) <= max
      ? Number(value)
      : fallback;
  return {
    page: positiveInteger(params.page, 1, 2147483647),
    pageSize: positiveInteger(params.pageSize, 10, 100),
  };
}
