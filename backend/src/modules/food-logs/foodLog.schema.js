const { z } = require('zod');

/**
 * Schema for POST /food-logs — saving a confirmed food log entry.
 */
const saveFoodLogSchema = z.object({
  meal_name: z.string().min(1, 'Meal name is required').max(255),
  calories: z
    .coerce.number({ invalid_type_error: 'calories must be a number' })
    .min(0),
  protein: z
    .number({ invalid_type_error: 'protein must be a number' })
    .min(0),
  carbs: z
    .number({ invalid_type_error: 'carbs must be a number' })
    .min(0),
  fat: z
    .number({ invalid_type_error: 'fat must be a number' })
    .min(0),
  image_url: z.string().url('image_url must be a valid URL').optional().or(z.literal('')),
  is_manual_override: z.boolean().optional().default(false),
  logged_at: z
    .string()
    .datetime({ offset: true })
    .optional(), // defaults to NOW() in DB if omitted
});

/**
 * Schema for PATCH /food-logs/:id — partial update of nutrition values.
 * At least one field must be provided.
 */
const updateFoodLogSchema = z
  .object({
    meal_name: z.string().min(1).max(255).optional(),
    calories: z.coerce.number().min(0).optional(),
    protein: z.coerce.number().min(0).optional(),
    carbs: z.coerce.number().min(0).optional(),
    fat: z.coerce.number().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

/**
 * Schema for GET /food-logs query params.
 * Used manually in the controller — not via validate() middleware (body-only).
 */
const listQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

module.exports = { saveFoodLogSchema, updateFoodLogSchema, listQuerySchema };
