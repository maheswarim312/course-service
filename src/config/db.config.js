import dotenv from 'dotenv';
dotenv.config();

export default {
  HOST: process.env.DB_HOST || 'localhost',
  USER: process.env.DB_USER || 'root',
  PASSWORD: process.env.DB_PASS || '',
  DB: process.env.DB_NAME || 'course_db',
  dialect: 'mysql'
};