export default (sequelize, Sequelize) => {
  const Schedule = sequelize.define('schedule', {
    day: { type: Sequelize.STRING },
    time: { type: Sequelize.STRING }
  });
  return Schedule;
};