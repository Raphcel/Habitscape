const { query } = require('../../config/database');

const mapSummaryRow = (row) => {
  if (!row) return null;
  const recap = row.recommendations ?? {};

  return {
    id: row.id,
    user_id: row.user_id,
    date: row.summary_date,
    summary_text: row.summary_text,
    ai_recommendation: row.summary_text,
    meals_count: Number(recap.meals_count ?? 0),
    total_calories: Number(recap.total_calories ?? 0),
    total_protein_g: Number(recap.total_protein_g ?? 0),
    total_carbs_g: Number(recap.total_carbs_g ?? 0),
    total_fat_g: Number(recap.total_fat_g ?? 0),
    nutritional_score: recap.nutritional_score ?? null,
    recap_payload: recap,
    generated_at: row.generated_at,
  };
};

const findByDate = async (userId, date) => {
  const result = await query(
    `SELECT
       id,
       user_id,
       summary_date::text AS summary_date,
       summary_text,
       recommendations,
       generated_at
     FROM daily_summaries
     WHERE user_id = $1 AND summary_date = $2
     LIMIT 1`,
    [userId, date]
  );

  return mapSummaryRow(result.rows[0]);
};

const upsertSummary = async (userId, date, recap) => {
  const result = await query(
    `INSERT INTO daily_summaries (
       user_id,
       summary_date,
       summary_text,
       recommendations,
       generated_at
     )
     VALUES ($1, $2, $3, $4::jsonb, NOW())
     ON CONFLICT (user_id, summary_date)
     DO UPDATE SET
       summary_text = EXCLUDED.summary_text,
       recommendations = EXCLUDED.recommendations,
       generated_at = NOW()
     RETURNING
       id,
       user_id,
       summary_date::text AS summary_date,
       summary_text,
       recommendations,
       generated_at`,
    [
      userId,
      date,
      recap.ai_recommendation ?? recap.summary_text ?? '',
      JSON.stringify(recap),
    ]
  );

  return mapSummaryRow(result.rows[0]);
};

module.exports = {
  findByDate,
  upsertSummary,
};
