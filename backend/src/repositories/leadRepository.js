const { callResponse } = require("../db/routines");
const values = (lead) => [
  lead.name,
  lead.phone,
  lead.email,
  lead.budget,
  lead.location,
  lead.property_type,
  lead.source,
  lead.status,
];
module.exports = {
  createLead: (lead) => callResponse("crm_json_create_lead", values(lead), 201),
  getAllLeads: ({
    search,
    source,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize,
  }) =>
    callResponse("crm_json_list_leads", [
      search || null,
      source || null,
      status || null,
      sortBy,
      sortOrder,
      page,
      pageSize,
    ]),
  getLeadById: (id) => callResponse("crm_json_get_lead", [id]),
  updateLead: (id, lead) => callResponse("crm_json_update_lead", [id, ...values(lead)]),
  updateLeadStatus: (id, status) =>
    callResponse("crm_json_update_lead_status", [id, status]),
  deleteLead: (id) => callResponse("crm_json_delete_lead", [id]),
  createLeadNote: (id, note) => callResponse("crm_json_add_note", [id, note], 201),
  getLeadNotes: (id) => callResponse("crm_json_list_notes", [id]),
};
