import "./config/env.config.js";
import express from "express";
import { bootstrap } from "./src/index.router.js";
import { connectDB } from "./DB/connection.js";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();
const port = process.env.PORT;

const swaggerOptions = {
    customCss: `
      .swagger-ui .topbar { background-color: #263B5B; }
      .swagger-ui .info .title { color: #263B5B; }
      .swagger-ui .scheme-container { background-color: #f0f0f0; }
    `,
    customSiteTitle: "Topamun API Docs",
};

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

app.get("/", (req, res) => res.send("Hello World!"));

connectDB();
bootstrap(app, express);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
