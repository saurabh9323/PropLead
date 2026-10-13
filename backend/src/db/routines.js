const pool = require("./db");

const allowed = new Set([
  "crm_json_create_lead",
  "crm_json_get_lead",
  "crm_json_update_lead",
  "crm_json_update_lead_status",
  "crm_json_delete_lead",
  "crm_json_add_note",
  "crm_json_list_notes",
  "crm_json_get_user",
  "crm_json_profile",
  "crm_json_list_users",
  "crm_json_list_roles",
  "crm_json_auth_user",
  "crm_json_find_user",
  "crm_json_get_role",
  "crm_json_seed_user",
  "crm_json_list_leads",
  "crm_json_dashboard",
  "crm_json_create_user",
  "crm_json_session",
  "crm_json_logout",
  "crm_health",
  "crm_create_lead",
  "crm_get_lead",
  "crm_update_lead",
  "crm_update_lead_status",
  "crm_delete_lead",
  "crm_add_note",
  "crm_list_notes",
  "crm_list_leads",
  "crm_dashboard",
  "crm_auth_user",
  "crm_get_user",
  "crm_list_users",
  "crm_find_user",
  "crm_list_roles",
  "crm_get_role",
  "crm_create_user",
  "crm_update_password",
  "crm_seed_user",
]);

async function callRows(name, values = []) {
  if (!allowed.has(name)) throw new Error("Unknown database routine");
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
  const result = await pool.query(
    `SELECT * FROM public.${name}(${placeholders})`,
    values,
  );
  return result.rows;
}
async function callOne(name, values) {
  return (await callRows(name, values))[0];
}
async function callValue(name, values) {
  return (await callOne(name, values))?.[name];
}
async function callResponse(name, values = [], statusCode = 200) {
  if (!allowed.has(name)) throw new Error("Unknown database routine");
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
  const result = await pool.query(
    `SELECT public.crm_response(public.${name}(${placeholders}), $${values.length + 1}::integer) AS response`,
    [...values, statusCode],
  );
  return result.rows[0]?.response;
}
module.exports = { callRows, callOne, callValue, callResponse };
