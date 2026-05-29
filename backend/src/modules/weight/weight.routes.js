const { Router } = require('express');
const weightController = require('./weight.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { addWeightSchema } = require('./weight.schema');

const router = Router();

router.use(authenticate);

router.post('/', validate(addWeightSchema), weightController.addWeight);
router.get('/', weightController.getHistory);

module.exports = router;
