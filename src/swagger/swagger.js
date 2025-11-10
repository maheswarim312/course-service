import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Service API',
      version: '1.0.0',
      description: 'Swagger documentation for Course Service'
    }
  },
  apis: ['./src/routes/*.js']
};

export const swaggerDocs = swaggerJsdoc(options);
export { swaggerUi };