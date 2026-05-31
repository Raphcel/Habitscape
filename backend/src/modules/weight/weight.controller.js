const weightService = require('./weight.service');
const { sendSuccess, sendCreated } = require('../../utils/response.helper');

const addWeight = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { weight_kg } = req.body;
    const log = await weightService.addWeight(userId, weight_kg);
    sendCreated(res, log, 'Weight logged successfully');
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await weightService.getHistory(userId);
    sendSuccess(res, history, 'Weight history retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addWeight,
  getHistory,
};
