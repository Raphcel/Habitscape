const { query } = require('../../config/database');

/**
 * Find a single user by email.
 * Returns the full row including password_hash (needed for login).
 */
const findByEmail = async (email) => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return result.rows[0] ?? null;
};

/**
 * Find a user by primary key.
 * Deliberately excludes password_hash — used for public-facing responses.
 */
const findById = async (id) => {
  const result = await query(
    `SELECT id, name, email, calorie_goal, protein_goal_g, carbs_goal_g,
            fat_goal_g, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
};

/**
 * Insert a new user row and return the created record (no password_hash).
 */
const createUser = async ({ name, email, passwordHash }) => {
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, calorie_goal, protein_goal_g,
               carbs_goal_g, fat_goal_g, created_at, updated_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
};

/**
 * Partially update a user's profile fields.
 * Only updates columns that are explicitly provided.
 */
const updateUser = async (id, fields) => {
  const allowed = ['name', 'calorie_goal', 'protein_goal_g', 'carbs_goal_g', 'fat_goal_g'];
  const sets = [];
  const values = [];
  let idx = 1;

  for (const col of allowed) {
    if (fields[col] !== undefined) {
      sets.push(`${col} = $${idx}`);
      values.push(fields[col]);
      idx++;
    }
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  const result = await query(
    `UPDATE users SET ${sets.join(', ')}
     WHERE id = $${idx}
     RETURNING id, name, email, calorie_goal, protein_goal_g,
               carbs_goal_g, fat_goal_g, created_at, updated_at`,
    values
  );
  return result.rows[0] ?? null;
};

module.exports = { findByEmail, findById, createUser, updateUser };
