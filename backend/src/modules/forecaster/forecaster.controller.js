const forecasterService = require('./forecaster.service');
const { sendSuccess } = require('../../utils/response.helper');

/**
 * POST /api/v1/forecaster/predict-bmi
 * Forward lifestyle data to the BMI ML microservice and return the prediction.
 */
const predictBmi = async (req, res, next) => {
  try {
    const result = await forecasterService.predictBmi(req.body);
    return sendSuccess(res, result, 'BMI prediction complete');
  } catch (err) {
    next(err);
  }
};

module.exports = { predictBmi };
