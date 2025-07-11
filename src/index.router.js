import authRouter from "./modules/auth/auth.router.js";

import { globalErrorHandling } from "./utils/asyncHandler.js";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let swaggerDoc;
try {
  swaggerDoc = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "swagger-output.json"), "utf-8")
  );
} catch (error) {
  console.error("Error loading swagger-output.json:", error);
  swaggerDoc = {};
}

dotenv.config();

const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { background-color: #2D65B4; }
    .swagger-ui .topbar .link { color: #ffffff; }
    .swagger-ui .topbar .download-url-wrapper .select-label select { color: #ffffff; }
    .swagger-ui .info .title { color: #1e3a8a; font-family: 'Tajawal', sans-serif; }
    .swagger-ui .opblock-tag { background-color: #f1f3f5; color: #1e3a8a; border-color: #dee2e6; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background-color: #3B82F6; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background-color: #10B981; }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background-color: #F59E0B; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background-color: #EF4444; }
    .swagger-ui .btn.execute { background-color: #3B82F6; border-color: #3B82F6; }
    .swagger-ui .scheme-container { background-color: #f8f9fa; border: 1px solid #dee2e6; }
  `,
  customSiteTitle: "Topamine API Documentation",
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
};

export const bootstrap = (app, express) => {
  if (process.env.NODE_ENV == "dev") {
    app.use(morgan("common"));
  }

  app.use(cors());
  app.use(express.json());

  // Serve Swagger documentation
  app.get("/api-docs/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDoc);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, swaggerUiOptions)
  );

  app.use("/auth", authRouter);

  app.all("*", (req, res, next) => {
    return next(new Error("not found page", { cause: 404 }));
  });

  app.use(globalErrorHandling);
};
