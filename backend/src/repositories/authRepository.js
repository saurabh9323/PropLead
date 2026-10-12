const pool = require("../db/db");

const getUserByEmail = async (email) => {
  const query = `
    SELECT
      users.id,
      users.name,
      users.email,
      users.password_hash,
      roles.name AS role
    FROM users
    JOIN roles ON roles.id = users.role_id
    WHERE LOWER(users.email) = LOWER($1);
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];
};

const getUserById = async (userId) => {
  const query = `
    SELECT
      users.id,
      users.name,
      users.email,
      roles.name AS role
    FROM users
    JOIN roles ON roles.id = users.role_id
    WHERE users.id = $1;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};

module.exports = {
  updatePasswordHash: (id, hash) => pool.query("UPDATE users SET password_hash = $2 WHERE id = $1", [id, hash]),
  getUserByEmail,
  getUserById,
};
