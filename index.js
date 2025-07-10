import "./config/env.config.js";
import express from "express";
import { bootstrap } from "./src/index.router.js";
import { connectDB } from "./DB/connection.js";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();
const port = process.env.PORT;

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => res.send("Hello World!"));

connectDB();
bootstrap(app, express);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
