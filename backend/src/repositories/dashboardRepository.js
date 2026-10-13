const { callResponse } = require("../db/routines");
module.exports = {
  getDashboardCounts: ({ page, pageSize }) =>
    callResponse("crm_json_dashboard", [page, pageSize]),
};
