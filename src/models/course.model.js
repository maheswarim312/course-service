// File: src/models/course.model.js
// Versi "Enhance 2.0"

export default (sequelize, Sequelize) => {
  const Course = sequelize.define('course', {
    title: { 
      type: Sequelize.STRING 
    },
    description: { 
      type: Sequelize.TEXT 
    },
    teacher_id: { 
      type: Sequelize.INTEGER 
    },
    thumbnail: {
      type: Sequelize.STRING,
      defaultValue: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400&h=250&fit=crop"
    },
    category: {
      type: Sequelize.STRING,
      defaultValue: "General"
    }
  });
  return Course;
};