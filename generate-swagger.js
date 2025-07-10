import fs from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

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
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: [path.resolve(process.cwd(), './src/modules/auth/auth.router.js')],
};

try {
  const swaggerSpec = swaggerJSDoc(options);
  fs.writeFileSync(
    path.resolve(process.cwd(), './swagger-spec.json'),
    JSON.stringify(swaggerSpec, null, 2)
  );
  console.log('Swagger spec generated successfully.');
} catch (error) {
  console.error('Error generating Swagger spec:', error);
  process.exit(1);
} 