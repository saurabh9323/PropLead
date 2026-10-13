const { callValue, callResponse } = require("../db/routines");
module.exports = {
  getAllUsers: () => callResponse("crm_json_list_users"),
  getUserById: (id) => callResponse("crm_json_get_user", [id]),
  getUserByEmail: (email) => callValue("crm_json_find_user", [email]),
  getAllRoles: () => callResponse("crm_json_list_roles"),
  getRoleById: (id) => callValue("crm_json_get_role", [id]),
  createUser: (user) =>
    callResponse("crm_json_create_user", [
      user.name,
      user.email,
      user.passwordHash,
      user.roleId,
    ], 201),
  updateUser: (id, user) =>
    callResponse("crm_json_update_user", [
      id,
      user.name,
      user.email,
      user.roleId,
    ]),
  deleteUser: (id) => callResponse("crm_json_delete_user", [id]),
  seedUser: (name, email, hash, role) =>
    callValue("crm_json_seed_user", [name, email, hash, role]),
};
