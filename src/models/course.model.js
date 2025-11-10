export default (sequelize, Sequelize) => {
  const Course = sequelize.define('course', {
    title: { type: Sequelize.STRING },
    description: { type: Sequelize.TEXT },
    teacher_id: { type: Sequelize.INTEGER }
  });
  return Course;
};