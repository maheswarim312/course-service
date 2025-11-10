import Sequelize from 'sequelize';
import dbConfig from '../config/db.config.js';
import CourseModel from './course.model.js';
import MaterialModel from './material.model.js';
import ScheduleModel from './schedule.model.js';

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Course = CourseModel(sequelize, Sequelize);
db.Material = MaterialModel(sequelize, Sequelize);
db.Schedule = ScheduleModel(sequelize, Sequelize);

db.Course.hasMany(db.Material, { foreignKey: 'course_id', as: 'materials' });
db.Course.hasOne(db.Schedule, { foreignKey: 'course_id', as: 'schedule' });
db.Material.belongsTo(db.Course, { foreignKey: 'course_id' });
db.Schedule.belongsTo(db.Course, { foreignKey: 'course_id' });

export default db;