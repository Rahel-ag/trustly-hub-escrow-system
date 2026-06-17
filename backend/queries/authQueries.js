const pool = require('../db');

const createUser = async (email, hashedPassword, fullName, role = 'freelancer') => {
  const query = `
    INSERT INTO users (email, password, full_name, role, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id, email, full_name, role;
  `;
  const result = await pool.query(query, [email, hashedPassword, fullName, role]);
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1;';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

module.exports = { createUser, getUserByEmail };