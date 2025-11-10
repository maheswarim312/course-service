import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { swaggerDocs, swaggerUi } from './swagger/swagger.js';
import courseRoutes from './routes/course.routes.js';
import db from './models/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/courses', courseRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

db.sequelize.sync().then(() => {
  console.log('✅ Database connected and synced');
});

app.get('/', (req, res) => {
  res.send('Course Service is running 🚀');
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Course Service running on port ${PORT}`));