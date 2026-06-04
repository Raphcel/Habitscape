const { Router } = require('express');
const rateLimit = require('express-rate-limit');

const forecasterController = require('./forecaster.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { predictBmiSchema } = require('./forecaster.schema');

const router = Router();

// Rate-limit the ML-heavy predict endpoint: 30 req / 15 min per IP
const predictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many prediction requests, please try again later.' },
});

// ─── Swagger Docs ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Forecaster
 *   description: BMI prediction and health forecasting via ML model
 */

/**
 * @swagger
 * /forecaster/predict-bmi:
 *   post:
 *     summary: Predict BMI category using ML model + AI health recommendation
 *     tags: [Forecaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fat_total_g
 *               - height_cm
 *               - age
 *               - sleep_hours
 *               - calorie_daily
 *               - diet_quality_num
 *               - smoker_num
 *               - alcohol_num
 *               - stress_level
 *               - exercise_freq_num
 *             properties:
 *               fat_total_g:
 *                 type: number
 *                 example: 70
 *                 description: Total daily fat intake (grams)
 *               height_cm:
 *                 type: number
 *                 example: 170
 *                 description: Height in centimeters
 *               age:
 *                 type: number
 *                 example: 22
 *                 description: Age in years
 *               sleep_hours:
 *                 type: number
 *                 example: 6.0
 *                 description: Hours of sleep per day
 *               calorie_daily:
 *                 type: number
 *                 example: 2200
 *                 description: Daily calorie intake (kcal)
 *               diet_quality_num:
 *                 type: integer
 *                 example: 3
 *                 description: "Diet quality rating (1-5)"
 *               smoker_num:
 *                 type: integer
 *                 example: 0
 *                 description: "Smoker? (0=no, 1=yes)"
 *               alcohol_num:
 *                 type: integer
 *                 example: 1
 *                 description: "Alcohol consumption (0=none, 1=light, 2=heavy)"
 *               stress_level:
 *                 type: number
 *                 example: 8
 *                 description: "Stress level (1-10)"
 *               exercise_freq_num:
 *                 type: number
 *                 example: 4
 *                 description: Exercise frequency per week
 *     responses:
 *       200:
 *         description: BMI prediction result with AI recommendation
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
 *                         bmi_category:
 *                           type: string
 *                           example: Normal
 *                         bmi_category_encoded:
 *                           type: integer
 *                           example: 1
 *                         confidence:
 *                           type: number
 *                           example: 0.89
 *                         probabilities:
 *                           type: object
 *                           properties:
 *                             Underweight:
 *                               type: number
 *                             Normal:
 *                               type: number
 *                             Overweight:
 *                               type: number
 *                             Obese:
 *                               type: number
 *                         ai_recommendation:
 *                           type: string
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       429:
 *         description: Too many requests
 *       502:
 *         description: BMI ML service unavailable
 */
router.post(
  '/predict-bmi',
  authenticate,
  predictLimiter,
  validate(predictBmiSchema),
  forecasterController.predictBmi
);

module.exports = router;
