const { pool } = require('../../config/database');

const insertWeightLog = async (userId, weightKg) => {
  const query = `
    INSERT INTO weight_logs (user_id, weight_kg)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [userId, weightKg]);
  return rows[0];
};

const updateUsersWeight = async (userId, weightKg) => {
  const query = `
    UPDATE users
    SET weight_kg = $2
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [userId, weightKg]);
  return rows[0];
};

const getWeightHistory = async (userId) => {
  const query = `
    SELECT id, weight_kg, logged_at
    FROM weight_logs
    WHERE user_id = $1
    ORDER BY logged_at ASC;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

module.exports = {
  insertWeightLog,
  updateUsersWeight,
  getWeightHistory,
};
