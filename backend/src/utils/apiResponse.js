// Infrastructure/errors use this envelope; database success payloads use crm_response.
function apiResponse(statusCode, message, data = null, pagination = null) {
  return { ok: statusCode >= 200 && statusCode < 300, statusCode, message, data, pagination };
}
module.exports = apiResponse;
