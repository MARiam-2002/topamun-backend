import authRouter from "./modules/auth/auth.router.js";

import { globalErrorHandling } from "./utils/asyncHandler.js";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

// Read and parse the swagger file in a way that's compatible with serverless environments
const swaggerFilePath = path.join(process.cwd(), "swagger-output.json");
const swaggerFile = fs.readFileSync(swaggerFilePath, "utf8");
const swaggerDoc = JSON.parse(swaggerFile);

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
  customfavIcon: "https://your-favicon-url/favicon.ico", // You can add your favicon link here
};

export const bootstrap = (app, express) => {
  if (process.env.NODE_ENV == "dev") {
    app.use(morgan("common"));
  }

  // const whiteList = ["http://127.0.0.1:5500",undefined];

  // app.use((req, res, next) => {
  //   if (req.originalUrl.includes("/auth/confirmEmail")) {
  //     res.setHeader("Access-Control-Allow-Origin", "*");
  //     res.setHeader("Access-Control-Allow-Methods", "GET");
  //     return next();
  //   }
  //   if (!whiteList.includes(req.header("origin"))) {
  //     return next(new Error("Blocked By CORS!"));
  //   }
  //   res.setHeader("Access-Control-Allow-Origin", "*");
  //   res.setHeader("Access-Control-Allow-Headers", "*");
  //   res.setHeader("Access-Control-Allow-Methods", "*");
  //   res.setHeader("Access-Control-Allow-Private-Network", true);
  //   return next();
  // });
  // app.use((req, res, next) => {
  //   console.log(req.originalUrl);
  //   if (req.originalUrl == "/order/webhook") {
  //     next();
  //   } else {
  //     express.json()(req, res, next);
  //   }
  // });
  app.use(cors());
  app.use(express.json());

  // Serve Swagger documentation
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, swaggerUiOptions)
  );

  app.use("/auth", authRouter);

  app.all("*", (req, res, next) => {
    console.log(3);
    return next(new Error("not found page", { cause: 404 }));
  });

  app.use((error, req, res, next) => {
    return res.json({ message: error.message, stack: error.stack });
  });
  app.use(globalErrorHandling);
};
