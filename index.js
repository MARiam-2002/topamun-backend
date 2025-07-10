import "./config/env.config.js";
import express from "express";
import { bootstrap } from "./src/index.router.js";
import { connectDB } from "./DB/connection.js";
import fs from 'fs';
import path from 'path';
import { AppError } from "./src/utils/error.class.js";
import { globalErrorHandling } from "./src/utils/error-handling.js";

const swaggerSpec = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './swagger-spec.json'), 'utf8'));

const app = express();

// Connect to DB on cold start
connectDB();

// Serve swagger spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Serve simple HTML page with Swagger UI
app.get('/api-docs', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Topamun API Documentation</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
      <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            url: '/api-docs.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
          });
        };
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Setup API routes
bootstrap(app, express);

// 404 handler for unmatched routes
app.all("*", (req, res, next) => {
  return next(new AppError(`Page not found: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandling);

export default app;
