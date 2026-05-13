const foodLogService = require('./foodLog.service');
const { listQuerySchema } = require('./foodLog.schema');
const { sendSuccess, sendCreated, sendError } = require('../../utils/response.helper');

/**
 * POST /api/v1/food-logs/analyze
 * Upload image → forward to FastAPI → return nutrition data (no DB write).
 */
const analyzeFood = async (req, res, next) => {
  try {
    const result = await foodLogService.analyzeFood(req.file, req.user.id);
    return sendSuccess(res, result, 'Food analysis complete');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/food-logs
 * Save a confirmed food log for the authenticated user.
 */
const saveFoodLog = async (req, res, next) => {
  try {
    const log = await foodLogService.saveFoodLog(req.user.id, req.body);
    return sendCreated(res, { foodLog: log }, 'Food log saved');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/food-logs
 * List food logs with optional date filter and pagination.
 */
const getFoodLogs = async (req, res, next) => {
  try {
    // Validate query params with Zod (not body, so we call it manually)
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return res.status(400).json({ success: false, message: 'Invalid query parameters', errors });
    }

    const { date, limit, offset } = parsed.data;
    const { data, total } = await foodLogService.getFoodLogs(req.user.id, { date, limit, offset });

    return sendSuccess(res, { data, total, limit, offset }, 'Food logs retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/food-logs/:id
 * Partially update a food log's nutrition values.
 */
const updateFoodLog = async (req, res, next) => {
  try {
    const log = await foodLogService.updateFoodLog(req.params.id, req.user.id, req.body);
    return sendSuccess(res, { foodLog: log }, 'Food log updated');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/food-logs/:id
 * Delete a food log belonging to the authenticated user.
 */
const deleteFoodLog = async (req, res, next) => {
  try {
    await foodLogService.deleteFoodLog(req.params.id, req.user.id);
    return sendSuccess(res, null, 'Food log deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { analyzeFood, saveFoodLog, getFoodLogs, updateFoodLog, deleteFoodLog };
