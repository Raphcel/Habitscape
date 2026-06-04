const dailySummaryService = require('./dailySummary.service');
const { sendSuccess } = require('../../utils/response.helper');

const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

const validateDateParam = (date) => {
  if (!isValidDate(date)) {
    const err = new Error('date must be YYYY-MM-DD');
    err.statusCode = 400;
    throw err;
  }
};

const getSummary = async (req, res, next) => {
  try {
    const date = req.query.date;
    validateDateParam(date);
    const summary = await dailySummaryService.getSummary(req.user.id, date);
    return sendSuccess(res, { summary }, 'Daily summary retrieved');
  } catch (err) {
    next(err);
  }
};

const generateSummary = async (req, res, next) => {
  try {
    const { date } = req.body;
    validateDateParam(date);
    const summary = await dailySummaryService.generateSummary(req.user.id, date);
    return sendSuccess(res, { summary }, 'Daily summary generated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  generateSummary,
};
