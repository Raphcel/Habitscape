const { Router } = require('express');
const dailySummaryController = require('./dailySummary.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', dailySummaryController.getSummary);
router.post('/generate', dailySummaryController.generateSummary);

module.exports = router;
