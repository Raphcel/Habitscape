const weightQueries = require('./weight.query');

const addWeight = async (userId, weightKg) => {
  // Update users table
  await weightQueries.updateUsersWeight(userId, weightKg);
  // Insert log
  const newLog = await weightQueries.insertWeightLog(userId, weightKg);
  return newLog;
};

const getHistory = async (userId) => {
  const history = await weightQueries.getWeightHistory(userId);
  return history;
};

module.exports = {
  addWeight,
  getHistory,
};
