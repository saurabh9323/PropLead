const pool = require("../db/db");

const getAllUsers = async () => {
  const query = `
    SELECT
      users.id,
      users.name,
      users.email,
      roles.name AS role,
      users.created_at,
      users.updated_at
    FROM users
    JOIN roles ON roles.id = users.role_id
    ORDER BY users.created_at DESC;
  `;

  const result = await pool.query(query);

  return result.rows;
};

const getUserById = async (id) => {
  const query = `
    SELECT
      users.id,
      users.name,
      users.email,
      roles.name AS role,
      users.created_at,
      users.updated_at
    FROM users
    JOIN roles ON roles.id = users.role_id
    WHERE users.id = $1;
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const query = `
    SELECT id
    FROM users
    WHERE LOWER(email) = LOWER($1);
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];
};

const getAllRoles = async () => {
  const query = `
    SELECT id, name
    FROM roles
    ORDER BY name ASC;
  `;

  const result = await pool.query(query);

  return result.rows;
};

const getRoleById = async (roleId) => {
  const query = `
    SELECT id, name
    FROM roles
    WHERE id = $1;
  `;

  const result = await pool.query(query, [roleId]);

  return result.rows[0];
};

const createUser = async (user) => {
  const query = `
    INSERT INTO users (name, email, password_hash, role_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role_id, created_at, updated_at;
  `;

  const values = [user.name, user.email, user.passwordHash, user.roleId];
  const result = await pool.query(query, values);

  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getAllRoles,
  getRoleById,
  createUser,
};
