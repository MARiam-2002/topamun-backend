import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Topamun API',
      version: '1.0.0',
      description: 'API documentation for the Topamun learning platform.',
    },
    servers: [
      {
        url: 'https://topamun-backend.vercel.app/api/v1', 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/modules/auth/auth.router.js'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options); 