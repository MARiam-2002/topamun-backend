import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Topamine API Documentation",
      version: "1.0.0",
      description:
        "Welcome to the official Topamine API documentation. This document provides a comprehensive overview of all available endpoints for developers to interact with the Topamine platform.",
      contact: {
        name: "Topamine Support",
        email: "support@topamine.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000", // Update with your development server URL
        description: "Development Server",
      },
      {
        url: "https://your-production-url.com", // Update with your production URL
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "../modules/**/*.router.js")], // Absolute path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options); 