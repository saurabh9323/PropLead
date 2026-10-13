const { callValue, callResponse } = require("../db/routines");
module.exports = {
  createSession: (id, token, expires) => callResponse("crm_json_session", [id, token, expires]),
  logout: () => callResponse("crm_json_logout"),
  getUserByEmail: (email) => callValue("crm_json_auth_user", [email]),
  getUserById: (id) => callResponse("crm_json_profile", [id]),
  updatePasswordHash: (id, hash) =>
    callValue("crm_update_password", [id, hash]),
};
