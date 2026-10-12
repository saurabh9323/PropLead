require("dotenv").config();
const pool = require("../src/db/db");
const { hashPassword } = require("../src/utils/password");

async function main() {
  const {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_NAME = "Administrator",
  } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12)
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters).",
    );
  const role = await pool.query("SELECT id FROM roles WHERE name = 'admin'");
  if (!role.rows[0]) throw new Error("Apply sql/schema.sql first.");
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id",
    [
      ADMIN_NAME,
      ADMIN_EMAIL.trim().toLowerCase(),
      await hashPassword(ADMIN_PASSWORD),
      role.rows[0].id,
    ],
  );
  console.log(
    result.rowCount
      ? "Admin created."
      : "Account already exists; no changes made.",
  );
}
main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
