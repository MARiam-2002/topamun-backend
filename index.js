import "./config/env.config.js";
import express from "express";
import { bootstrap } from "./src/index.router.js";
import { connectDB } from "./DB/connection.js";
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const swaggerSpec = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './swagger-spec.json'), 'utf8'));

const app = express();
const port = process.env.PORT;

// Swagger UI with basic setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => res.send("Hello World!"));

connectDB();
bootstrap(app, express);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
