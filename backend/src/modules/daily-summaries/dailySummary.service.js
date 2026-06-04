const fastapiClient = require('../../utils/fastapi.client');
const foodLogQuery = require('../food-logs/foodLog.query');
const authQuery = require('../auth/auth.query');
const dailySummaryQuery = require('./dailySummary.query');

const getSummary = async (userId, date) => {
  return dailySummaryQuery.findByDate(userId, date);
};

const guessMealType = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 17) return 'snack';
  return 'dinner';
};

const toMealEntry = (log) => ({
  meal_type: guessMealType(log.logged_at),
  detected_foods: [log.meal_name || 'Unknown food'],
  nutrition: {
    foods: [
      {
        food_name: log.meal_name || 'Unknown food',
        serving_size_g: 0,
        calories_kcal: Number(log.calories || 0),
        protein_g: Number(log.protein || 0),
        carbs_g: Number(log.carbs || 0),
        fat_g: Number(log.fat || 0),
      },
    ],
    total_calories: Number(log.calories || 0),
    total_protein_g: Number(log.protein || 0),
    total_carbs_g: Number(log.carbs || 0),
    total_fat_g: Number(log.fat || 0),
  },
  timestamp: log.logged_at,
});

const toUserProfile = (user) => {
  if (!user) return null;

  return {
    name: user.name,
    age: user.age || null,
    height_cm: user.height_cm || null,
    weight_kg: user.weight_kg || null,
    gender: user.gender || null,
  };
};

const generateSummary = async (userId, date) => {
  const [{ data: foodLogs }, user] = await Promise.all([
    foodLogQuery.findFoodLogs({ userId, date, limit: 100, offset: 0 }),
    authQuery.findById(userId),
  ]);

  if (foodLogs.length === 0) {
    const err = new Error('No food logs found for this date. Log some meals first.');
    err.statusCode = 404;
    throw err;
  }

  const payload = {
    user_id: userId,
    date,
    meals: foodLogs.map(toMealEntry),
    user_profile: toUserProfile(user),
  };

  let mlResponse;
  try {
    const { data } = await fastapiClient.post('/api/v1/recap/daily', payload);
    mlResponse = data;
  } catch (err) {
    const status = err.response?.status ?? 502;
    const detail = err.response?.data?.detail ?? err.response?.data?.message;
    const message =
      typeof detail === 'string'
        ? detail
        : detail
          ? JSON.stringify(detail)
          : 'ML recap service is unavailable. Please try again later.';
    const serviceError = new Error(message);
    serviceError.statusCode = status;
    throw serviceError;
  }

  return dailySummaryQuery.upsertSummary(userId, date, mlResponse);
};

module.exports = {
  getSummary,
  generateSummary,
};
