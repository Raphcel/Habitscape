const path = require('path');
const FormData = require('form-data');
const fs = require('fs');
const fastapiClient = require('../../utils/fastapi.client');
const foodLogQuery = require('./foodLog.query');
const { UPLOAD_DIR } = require('../../config/env');

/**
 * Save the uploaded image as a food log, send to the FastAPI ML microservice 
 * for analysis, and return the updated nutrition prediction.
 *
 * @param {Express.Multer.File} file - The multer file object from the request
 * @param {string} userId - ID of the user uploading the food
 * @returns {object} The updated food log
 */
const analyzeFood = async (file, userId) => {
  if (!file) {
    const err = new Error('No image file provided');
    err.statusCode = 400;
    throw err;
  }

  // Build a stable public URL for the uploaded file
  const filename = path.basename(file.path);
  const imageUrl = `/uploads/${filename}`;

  // 1. Save an initial Food Log to the database immediately
  const log = await foodLogQuery.createFoodLog({
    userId,
    mealName: 'Analyzing...', // Temporary name until ML returns
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    imageUrl: imageUrl,
    isManualOverride: false,
  });

  // 2. Ask ML to process it by sending the DB ID and image URL
  // The ML service fetches the image instead of receiving it as FormData
  let mlResponse;
  try {
    const { data } = await fastapiClient.post('/predict/food', {
      log_id: log.id,
      image_url: imageUrl
    });
    mlResponse = data;
  } catch (err) {
    // If ML fails, update the log to reflect the failure
    await foodLogQuery.updateFoodLog(log.id, userId, { meal_name: 'Unknown food (ML Failed)' });
    
    const status = err.response?.status ?? 502;
    const message =
      err.response?.data?.detail ??
      'ML service is unavailable. Please try again later.';
    const serviceError = new Error(message);
    serviceError.statusCode = status;
    throw serviceError;
  }

  // 3. Update the DB with the ML result
  const mealName = mlResponse.meal_name ?? 'Unknown food';
  const calories = mlResponse.calories ?? mlResponse.calories_kcal ?? 0;
  const protein = mlResponse.protein ?? mlResponse.protein_g ?? 0;
  const carbs = mlResponse.carbs ?? mlResponse.carbs_g ?? 0;
  const fat = mlResponse.fat ?? mlResponse.fat_g ?? 0;

  const updatedLog = await foodLogQuery.updateFoodLog(log.id, userId, {
    meal_name: mealName,
    calories: calories,
    protein: protein,
    carbs: carbs,
    fat: fat,
  });

  return {
    ...updatedLog,
    confidence: mlResponse.confidence ?? null,
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
