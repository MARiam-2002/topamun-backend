import "./config/env.config.js";
import express from "express";
import { bootstrap } from "./src/index.router.js";
import { connectDB } from "./DB/connection.js";
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { AppError } from "./src/utils/error.class.js";
import { globalErrorHandling } from "./src/utils/error-handling.js";

const swaggerSpec = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './swagger-spec.json'), 'utf8'));

const app = express();

// Connect to DB on cold start
connectDB();

// Swagger UI - Must be before other routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Setup API routes
bootstrap(app, express);

// 404 handler for unmatched routes
app.all("*", (req, res, next) => {
  return next(new AppError(`Page not found: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandling);

export default app;
