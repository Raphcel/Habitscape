const { Router } = require('express');
const rateLimit = require('express-rate-limit');

const foodLogController = require('./foodLog.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { uploadImage } = require('../../middleware/upload.middleware');
const { saveFoodLogSchema, updateFoodLogSchema } = require('./foodLog.schema');

const router = Router();

// Rate-limit the ML-heavy analyze endpoint: 30 req / 15 min per IP
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many analyze requests, please try again later.' },
});

// ─── Swagger Docs ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: FoodLogs
 *   description: Food image analysis and nutrition logging
 */

/**
 * @swagger
 * /food-logs/analyze:
 *   post:
 *     summary: Analyze a food image and save an initial log to the DB
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: JPEG or PNG image, max 5 MB
 *     responses:
 *       200:
 *         description: Nutrition analysis result (and DB log)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         meal_name:
 *                           type: string
 *                           example: Nasi Goreng
 *                         calories:
 *                           type: integer
 *                           example: 450
 *                         protein:
 *                           type: number
 *                           example: 12.5
 *                         carbs:
 *                           type: number
 *                           example: 60.0
 *                         fat:
 *                           type: number
 *                           example: 18.0
 *                         confidence:
 *                           type: number
 *                           example: 0.91
 *                         image_url:
 *                           type: string
 *                           example: /uploads/food-1716000000000-123456789.jpg
 *       400:
 *         description: No image provided or invalid file type/size
 *       401:
 *         description: Authentication required
 *       429:
 *         description: Too many requests
 *       502:
 *         description: ML service unavailable
 */
router.post(
  '/analyze',
  authenticate,
  analyzeLimiter,
  uploadImage,
  foodLogController.analyzeFood
);

/**
 * @swagger
 * /food-logs:
 *   post:
 *     summary: Save a confirmed food log entry
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meal_name, calories, protein, carbs, fat]
 *             properties:
 *               meal_name:
 *                 type: string
 *                 example: Nasi Goreng
 *               calories:
 *                 type: integer
 *                 example: 450
 *               protein:
 *                 type: number
 *                 example: 12.5
 *               carbs:
 *                 type: number
 *                 example: 60.0
 *               fat:
 *                 type: number
 *                 example: 18.0
 *               image_url:
 *                 type: string
 *                 example: /uploads/food-1716000000000-123456789.jpg
 *               is_manual_override:
 *                 type: boolean
 *                 example: false
 *               logged_at:
 *                 type: string
 *                 format: date-time
 *                 example: '2025-05-06T12:00:00Z'
 *     responses:
 *       201:
 *         description: Food log saved
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 */
router.post('/', authenticate, validate(saveFoodLogSchema), foodLogController.saveFoodLog);

/**
 * @swagger
 * /food-logs:
 *   get:
 *     summary: Get paginated food logs for the authenticated user
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: '2025-05-06'
 *         description: Filter logs by date (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Paginated food log list
 *       401:
 *         description: Authentication required
 */
router.get('/', authenticate, foodLogController.getFoodLogs);

/**
 * @swagger
 * /food-logs/{id}:
 *   patch:
 *     summary: Partially update a food log
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meal_name:
 *                 type: string
 *               calories:
 *                 type: integer
 *               protein:
 *                 type: number
 *               carbs:
 *                 type: number
 *               fat:
 *                 type: number
 *     responses:
 *       200:
 *         description: Food log updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Food log not found
 */
router.patch('/:id', authenticate, validate(updateFoodLogSchema), foodLogController.updateFoodLog);

/**
 * @swagger
 * /food-logs/{id}:
 *   delete:
 *     summary: Delete a food log
 *     tags: [FoodLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Food log deleted
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Food log not found
 */
router.delete('/:id', authenticate, foodLogController.deleteFoodLog);

module.exports = router;
