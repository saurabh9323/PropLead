const pool = require("../db/db");

const createLead = async (lead) => {
  const query = `
    INSERT INTO leads (
      name,
      phone,
      email,
      budget,
      location,
      property_type,
      source,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    lead.name,
    lead.phone,
    lead.email,
    lead.budget,
    lead.location,
    lead.property_type,
    lead.source,
    lead.status,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllLeads = async ({ search, source, status, sortBy, sortOrder }) => {
  const query = `
    SELECT *
    FROM get_all_leads($1, $2, $3, $4, $5);
  `;

  const values = [search || null, source || null, status || null, sortBy, sortOrder];
  const result = await pool.query(query, values);

  return result.rows;
};

const getLeadById = async (leadId) => {
  const query = `
    SELECT *
    FROM get_lead_by_id($1);
  `;

  const result = await pool.query(query, [leadId]);

  return result.rows[0];
};

const updateLead = async (leadId, lead) => {
  const query = `
    UPDATE leads
    SET
      name = $2,
      phone = $3,
      email = $4,
      budget = $5,
      location = $6,
      property_type = $7,
      source = $8,
      status = $9,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  const values = [
    leadId,
    lead.name,
    lead.phone,
    lead.email,
    lead.budget,
    lead.location,
    lead.property_type,
    lead.source,
    lead.status,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const deleteLead = async (leadId) => {
  const query = `
    DELETE FROM leads
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [leadId]);

  return result.rows[0];
};

const createLeadNote = async (leadId, note) => {
  const query = `
    INSERT INTO lead_notes (lead_id, note)
    VALUES ($1, $2)
    RETURNING *;
  `;

  const result = await pool.query(query, [leadId, note]);

  return result.rows[0];
};

const getLeadNotes = async (leadId) => {
  const query = `
    SELECT *
    FROM lead_notes
    WHERE lead_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [leadId]);

  return result.rows;
};

const updateLeadStatus = async (id, status) => {
  const result = await pool.query("UPDATE leads SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *", [id, status]);
  return result.rows[0];
};

module.exports = {
  updateLeadStatus,
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  createLeadNote,
  getLeadNotes,
};
