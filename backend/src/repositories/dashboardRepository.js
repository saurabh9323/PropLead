const pool = require("../db/db");

const getDashboardCounts = async () => {
  const totalResult = await pool.query(`
    SELECT COUNT(*)::int AS total_leads
    FROM leads;
  `);

  const closedResult = await pool.query(`
    SELECT COUNT(*)::int AS closed_leads
    FROM leads
    WHERE status = 'Closed';
  `);

  const sourceResult = await pool.query(`
    SELECT source, COUNT(*)::int AS count
    FROM leads
    GROUP BY source
    ORDER BY count DESC, source ASC;
  `);

  const statusResult = await pool.query(`
    SELECT status, COUNT(*)::int AS count
    FROM leads
    GROUP BY status
    ORDER BY count DESC, status ASC;
  `);

  return {
    totalLeads: totalResult.rows[0].total_leads,
    closedLeads: closedResult.rows[0].closed_leads,
    leadsBySource: sourceResult.rows,
    statusDistribution: statusResult.rows,
  };
};

module.exports = {
  getDashboardCounts,
};
