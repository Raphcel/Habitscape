const { query } = require('../../config/database');

/**
 * Insert a new food log row.
 * Returns the full newly-created record.
 */
const createFoodLog = async ({ userId, mealName, calories, protein, carbs, fat, imageUrl, isManualOverride, loggedAt }) => {
  const result = await query(
    `INSERT INTO food_logs
       (user_id, meal_name, calories_kcal, protein_g, carbs_g, fat_g,
        image_url, is_manual_override, logged_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9::timestamptz, NOW()))
     RETURNING
       id, user_id, meal_name,
       calories_kcal AS calories,
       protein_g     AS protein,
       carbs_g       AS carbs,
       fat_g         AS fat,
       image_url, is_manual_override, logged_at, created_at`,
    [userId, mealName, calories, protein, carbs, fat, imageUrl ?? null, isManualOverride ?? false, loggedAt ?? null]
  );
  return result.rows[0];
};

/**
 * Paginated list of food logs for a user.
 * Optionally filtered to a specific local date (Asia/Jakarta, YYYY-MM-DD).
 */
const findFoodLogs = async ({ userId, date, limit, offset }) => {
  const params = [userId, limit, offset];
  let dateClause = '';

  if (date) {
    // The frontend sends the user's local calendar date.
    // Supabase stores TIMESTAMPTZ in UTC, so compare in the app's local timezone.
    dateClause = `AND (logged_at AT TIME ZONE 'Asia/Jakarta')::date = $4::date`;
    params.push(date);
  }

  const result = await query(
    `SELECT
       id, user_id, meal_name,
       calories_kcal AS calories,
       protein_g     AS protein,
       carbs_g       AS carbs,
       fat_g         AS fat,
       image_url, is_manual_override, logged_at, created_at
     FROM food_logs
     WHERE user_id = $1
       ${dateClause}
     ORDER BY logged_at DESC
     LIMIT $2 OFFSET $3`,
    params
  );

  // Total count (for pagination metadata)
  const countParams = [userId];
  let countDateClause = '';
  if (date) {
    countDateClause = `AND (logged_at AT TIME ZONE 'Asia/Jakarta')::date = $2::date`;
    countParams.push(date);
  }

  const countResult = await query(
    `SELECT COUNT(*) AS total
     FROM food_logs
     WHERE user_id = $1
       ${countDateClause}`,
    countParams
  );

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total, 10),
  };
};

/**
 * Find a single food log by id, scoped to the owning user.
 */
const findFoodLogById = async (id, userId) => {
  const result = await query(
    `SELECT
       id, user_id, meal_name,
       calories_kcal AS calories,
       protein_g     AS protein,
       carbs_g       AS carbs,
       fat_g         AS fat,
       image_url, is_manual_override, logged_at, created_at
     FROM food_logs
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [id, userId]
  );
  return result.rows[0] ?? null;
};

/**
 * Partially update a food log.
 * Only columns present in `fields` are updated.
 */
const updateFoodLog = async (id, userId, fields) => {
  // Map public field names → DB column names
  const columnMap = {
    meal_name: 'meal_name',
    calories:  'calories_kcal',
    protein:   'protein_g',
    carbs:     'carbs_g',
    fat:       'fat_g',
  };

  const sets = [];
  const values = [];
  let idx = 1;

  for (const [field, col] of Object.entries(columnMap)) {
    if (fields[field] !== undefined) {
      sets.push(`${col} = $${idx}`);
      values.push(fields[field]);
      idx++;
    }
  }

  if (sets.length === 0) return findFoodLogById(id, userId);

  values.push(id, userId); // $idx and $idx+1

  const result = await query(
    `UPDATE food_logs
     SET ${sets.join(', ')}
     WHERE id = $${idx} AND user_id = $${idx + 1}
     RETURNING
       id, user_id, meal_name,
       calories_kcal AS calories,
       protein_g     AS protein,
       carbs_g       AS carbs,
       fat_g         AS fat,
       image_url, is_manual_override, logged_at, created_at`,
    values
  );
  return result.rows[0] ?? null;
};

/**
 * Delete a food log. Returns true if a row was deleted, false otherwise.
 */
const deleteFoodLog = async (id, userId) => {
  const result = await query(
    'DELETE FROM food_logs WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rowCount > 0;
};

module.exports = {
  createFoodLog,
  findFoodLogs,
  findFoodLogById,
  updateFoodLog,
  deleteFoodLog,
};
