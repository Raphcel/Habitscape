const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .max(255)
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password too long'), // bcrypt max
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  // Use coerce so JSON-parsed numbers and string-numbers both work
  calorie_goal:   z.coerce.number().int().positive().optional(),
  protein_goal_g: z.coerce.number().int().positive().optional(),
  carbs_goal_g:   z.coerce.number().int().positive().optional(),
  fat_goal_g:     z.coerce.number().int().positive().optional(),
});

module.exports = { registerSchema, loginSchema, updateProfileSchema };
