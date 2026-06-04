import axios from 'axios';

/**
 * Dedicated axios instance for the Habitscape ML API (Railway).
 *
 * This is separate from the Express backend API client (api.js).
 * The ML service handles food detection, nutrition estimation, and daily recaps.
 *
 * Base URL comes from VITE_ML_API_URL env var.
 * Falls back to a Vite dev-server proxy (/ml-api) if the env var is not set,
 * which avoids CORS issues during local development.
 */
const ML_BASE = import.meta.env.VITE_ML_API_URL || '/ml-api';
const ML_API_KEY = import.meta.env.VITE_ML_API_KEY || '';

const mlClient = axios.create({
  baseURL: ML_BASE,
  timeout: 120_000, // ML inference can be slow — 2 min timeout
});

// Attach API key if available
if (ML_API_KEY) {
  mlClient.interceptors.request.use((config) => {
    config.headers['Authorization'] = `Bearer ${ML_API_KEY}`;
    return config;
  });
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/detect
 * Upload food image → get detected foods with bounding boxes & confidence.
 *
 * @param {File} file - Image file (JPG/PNG, max 10MB)
 * @returns {Promise<{
 *   detected_foods: Array<{ label: string, confidence: number, bbox: number[] }>,
 *   unique_foods: string[],
 *   image_id: string
 * }>}
 */
export async function detectFood(file) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await mlClient.post('/api/v1/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * POST /api/v1/nutrition
 * Estimate nutrition from a list of food names.
 *
 * @param {string[]} foodNames - e.g. ["ayam goreng", "nasi", "tempe goreng"]
 * @returns {Promise<{
 *   foods: Array<{ food_name: string, serving_size_g: number, calories_kcal: number, protein_g: number, carbs_g: number, fat_g: number, fiber_g?: number, notes?: string }>,
 *   total_calories: number,
 *   total_protein_g: number,
 *   total_carbs_g: number,
 *   total_fat_g: number
 * }>}
 */
export async function estimateNutrition(foodNames) {
  const { data } = await mlClient.post('/api/v1/nutrition', foodNames);
  return data;
}

/**
 * POST /api/v1/analyze
 * All-in-one: upload image → detect foods → estimate nutrition → AI summary.
 *
 * @param {File} file - Image file (JPG/PNG, max 10MB)
 * @returns {Promise<{
 *   detection: { detected_foods: Array, unique_foods: string[], image_id: string },
 *   nutrition: { foods: Array, total_calories: number, total_protein_g: number, total_carbs_g: number, total_fat_g: number },
 *   ai_summary: string
 * }>}
 */
export async function analyzeFood(file) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await mlClient.post('/api/v1/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * POST /api/v1/recap/daily
 * Daily nutrition recap + AI recommendations.
 *
 * @param {{
 *   user_id: string,
 *   date: string,
 *   meals: Array<{
 *     meal_type: string,
 *     detected_foods: string[],
 *     nutrition: { foods: Array, total_calories: number, total_protein_g: number, total_carbs_g: number, total_fat_g: number },
 *     timestamp: string
 *   }>,
 *   user_profile?: object
 * }} payload
 * @returns {Promise<{
 *   user_id: string,
 *   date: string,
 *   total_calories: number,
 *   total_protein_g: number,
 *   total_carbs_g: number,
 *   total_fat_g: number,
 *   meals_count: number,
 *   ai_recommendation: string,
 *   nutritional_score?: string
 * }>}
 */
export async function getDailyRecap(payload) {
  const { data } = await mlClient.post('/api/v1/recap/daily', payload);
  return data;
}

export default mlClient;
