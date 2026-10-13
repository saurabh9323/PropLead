const fs = require("node:fs/promises");
const path = require("node:path");
const pool = require("../src/db/db");
const { callResponse } = require("../src/db/routines");

async function setup() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in backend/.env before installing database functions.");
  const client = await pool.connect();
  try {
    // Entire SQL files are installed together; no table queries are embedded in JS.
    const schema = await fs.readFile(
      path.join(__dirname, "../sql/schema.sql"),
      "utf8",
    );
    const functions = await fs.readFile(
      path.join(__dirname, "../sql/functions.sql"),
      "utf8",
    );
    await client.query(`BEGIN;\n${schema}\n${functions}\nCOMMIT;`);
    console.log("Schema and database functions installed.");
  } finally {
    client.release();
  }
  const dashboard = await callResponse("crm_json_dashboard", [1, 5]);
  if (!dashboard?.ok || dashboard.statusCode !== 200 || !dashboard.pagination || !Array.isArray(dashboard.data.recentLeads) || dashboard.data.recentLeads.length > 5) {
    throw new Error("Database JSON response verification failed");
  }
  console.log("PostgreSQL JSON response and page-size verification passed.");
}
setup()
  .catch((error) => {
    console.error(
      "Database setup failed:",
      error.message || error.code || "Connection unavailable",
    );
    process.exitCode = 1;
  })
  .finally(() => pool.end());
