const FormData = require('form-data');
const path = require('path');
const fastapiClient = require('../../utils/fastapi.client');
const supabase = require('../../utils/supabase.client');
const foodLogQuery = require('./foodLog.query');

/**
 * Send the uploaded image to the FastAPI ML microservice for analysis and
 * return a draft result. This does not create a food_logs row.
 *
 * @param {Express.Multer.File} file - The multer file object from the request
 * @returns {object} The unsaved food analysis draft
 */
const analyzeFood = async (file) => {
  if (!file) {
    const err = new Error('No image file provided');
    err.statusCode = 400;
    throw err;
  }

  let imageUrl = null;
  if (supabase) {
    try {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const uniqueName = `food-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(uniqueName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[Supabase Storage] Failed to upload image:', uploadError.message);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('food-images')
          .getPublicUrl(uniqueName);
        
        imageUrl = publicUrlData?.publicUrl || null;
        console.log('[Supabase Storage] Image uploaded successfully. Public URL:', imageUrl);
      }
    } catch (storageErr) {
      console.error('[Supabase Storage] Unexpected error during upload:', storageErr.message);
    }
  }

  let mlResponse;
  try {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname || 'food-image.jpg',
      contentType: file.mimetype,
      knownLength: file.size,
    });

    const { data } = await fastapiClient.post('/api/v1/analyze', formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    mlResponse = data;
  } catch (err) {
    const status = err.response?.status ?? 502;
    const detail = err.response?.data?.detail ?? err.response?.data?.message;
    const message =
      typeof detail === 'string'
        ? detail
        : detail
          ? JSON.stringify(detail)
          : 'ML service is unavailable. Please try again later.';
    const serviceError = new Error(message);
    serviceError.statusCode = status;
    throw serviceError;
  }

  const detectedFoods = mlResponse.detection?.detected_foods ?? [];
  const uniqueFoods = mlResponse.detection?.unique_foods ?? [];
  const nutrition = mlResponse.nutrition ?? {};
  const nutritionFoods = nutrition.foods?.map((food) => food.food_name).filter(Boolean) ?? [];
  const names = uniqueFoods.length > 0 ? uniqueFoods : nutritionFoods;
  const confidences = detectedFoods
    .map((food) => Number(food.confidence))
    .filter((confidence) => Number.isFinite(confidence));

  const confidence =
    confidences.length > 0
      ? confidences.reduce((total, value) => total + value, 0) / confidences.length
      : null;

  return {
    meal_name: names.length > 0 ? names.join(', ') : 'Unknown food',
    calories: Math.round(Number(nutrition.total_calories ?? 0)),
    protein: Number(nutrition.total_protein_g ?? 0),
    carbs: Number(nutrition.total_carbs_g ?? 0),
    fat: Number(nutrition.total_fat_g ?? 0),
    confidence,
    detected_foods: detectedFoods,
    nutrition,
    ai_summary: mlResponse.ai_summary ?? '',
    image_url: imageUrl,
  };
};

/**
 * Persist a confirmed food log entry to the database.
 *
 * @param {string} userId
 * @param {object} body - validated request body (saveFoodLogSchema output)
 */
const saveFoodLog = async (userId, body) => {
  const log = await foodLogQuery.createFoodLog({
    userId,
    mealName:         body.meal_name,
    calories:         body.calories,
    protein:          body.protein,
    carbs:            body.carbs,
    fat:              body.fat,
    imageUrl:         body.image_url || null,
    isManualOverride: body.is_manual_override ?? false,
    loggedAt:         body.logged_at ?? null,
  });
  return log;
};

/**
 * Retrieve paginated food logs for the authenticated user.
 *
 * @param {string} userId
 * @param {{ date?, limit, offset }} queryParams
 */
const getFoodLogs = async (userId, { date, limit, offset }) => {
  return foodLogQuery.findFoodLogs({ userId, date, limit, offset });
};

/**
 * Partially update a food log.  Throws 404 if the log does not belong to the user.
 *
 * @param {string} id  - food log UUID
 * @param {string} userId
 * @param {object} fields - validated PATCH body
 */
const updateFoodLog = async (id, userId, fields) => {
  const existing = await foodLogQuery.findFoodLogById(id, userId);
  if (!existing) {
    const err = new Error('Food log not found');
    err.statusCode = 404;
    throw err;
  }

  return foodLogQuery.updateFoodLog(id, userId, fields);
};

/**
 * Delete a food log by id, scoped to the authenticated user.
 *
 * @param {string} id
 * @param {string} userId
 */
const deleteFoodLog = async (id, userId) => {
  const deleted = await foodLogQuery.deleteFoodLog(id, userId);
  if (!deleted) {
    const err = new Error('Food log not found');
    err.statusCode = 404;
    throw err;
  }
};

module.exports = { analyzeFood, saveFoodLog, getFoodLogs, updateFoodLog, deleteFoodLog };
