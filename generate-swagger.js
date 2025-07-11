import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import fs from "fs";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Topamine API Documentation",
      version: "1.0.0",
      description:
        "Welcome to the official Topamine API documentation. This document provides a comprehensive overview of all available endpoints for developers to interact with the Topamine platform.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
      {
        url: "https://topamun-backend.vercel.app",
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
  apis: [path.join(process.cwd(), "src", "modules", "**", "*.router.js")],
};

const swaggerSpec = swaggerJsdoc(options);

// Write the swagger file to the src directory
fs.writeFileSync(
  path.join(process.cwd(), "src", "swagger-output.json"),
  JSON.stringify(swaggerSpec, null, 2)
);

console.log("Swagger JSON file generated successfully in src folder."); 