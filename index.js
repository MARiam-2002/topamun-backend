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
const port = process.env.PORT;

// Setup API routes
bootstrap(app, express);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler for unmatched routes
app.all("*", (req, res, next) => {
  return next(new AppError(`Page not found: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandling);

connectDB();

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
