const bmimlClient = require('../../utils/bmiml.client');

/**
 * Forward the BMI prediction request to the BMI ML microservice.
 *
 * @param {object} input - Validated BMI input (10 features)
 * @returns {object} BMI prediction result from ML service
 */
const predictBmi = async (input) => {
  let mlResponse;
  try {
    const { data } = await bmimlClient.post('/api/v1/predict-bmi', input);
    mlResponse = data;
  } catch (err) {
    const status = err.response?.status ?? 502;
    const detail = err.response?.data?.detail ?? err.response?.data?.message;
    const message =
      typeof detail === 'string'
        ? detail
        : detail
          ? JSON.stringify(detail)
          : 'BMI ML service is unavailable. Please try again later.';
    const serviceError = new Error(message);
    serviceError.statusCode = status;
    throw serviceError;
  }

  return {
    bmi_category: mlResponse.bmi_category,
    bmi_category_encoded: mlResponse.bmi_category_encoded,
    confidence: mlResponse.confidence,
    probabilities: mlResponse.probabilities,
    ai_recommendation: mlResponse.ai_recommendation ?? '',
  };
};

module.exports = { predictBmi };
