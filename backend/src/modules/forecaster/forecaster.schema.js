const { z } = require('zod');

/**
 * Schema for POST /forecaster/predict-bmi
 * Matches the BMI ML service's BMIInput schema (10 base features).
 */
const predictBmiSchema = z.object({
  fat_total_g: z
    .number({ invalid_type_error: 'fat_total_g must be a number' })
    .min(0, 'fat_total_g must be >= 0'),
  height_cm: z
    .number({ invalid_type_error: 'height_cm must be a number' })
    .min(50, 'height_cm must be >= 50')
    .max(300, 'height_cm must be <= 300'),
  age: z
    .number({ invalid_type_error: 'age must be a number' })
    .min(1, 'age must be >= 1')
    .max(150, 'age must be <= 150'),
  sleep_hours: z
    .number({ invalid_type_error: 'sleep_hours must be a number' })
    .min(0)
    .max(24),
  calorie_daily: z
    .number({ invalid_type_error: 'calorie_daily must be a number' })
    .min(0),
  diet_quality_num: z
    .number({ invalid_type_error: 'diet_quality_num must be a number' })
    .int()
    .min(1)
    .max(5),
  smoker_num: z
    .number({ invalid_type_error: 'smoker_num must be a number' })
    .int()
    .min(0)
    .max(1),
  alcohol_num: z
    .number({ invalid_type_error: 'alcohol_num must be a number' })
    .int()
    .min(0)
    .max(2),
  stress_level: z
    .number({ invalid_type_error: 'stress_level must be a number' })
    .min(1)
    .max(10),
  exercise_freq_num: z
    .number({ invalid_type_error: 'exercise_freq_num must be a number' })
    .min(0)
    .max(14),
});

module.exports = { predictBmiSchema };
