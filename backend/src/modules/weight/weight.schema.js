const { z } = require('zod');

const addWeightSchema = z.object({
  weight_kg: z.coerce.number().positive({ message: 'Weight must be a positive number' }),
});

module.exports = { addWeightSchema };
