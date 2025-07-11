import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Topamine API",
    description: "API Documentation for the Topamine platform.",
  },
  host: "topamun-backend.vercel.app", // Deployed URL
  schemes: ["https"],
  consumes: ["application/json", "multipart/form-data"],
  produces: ["application/json"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "token", // The header name
      in: "header",
      description:
        "Enter your bearer token in the format 'Bearer {token}'",
    },
  },
};

const outputFile = "./src/swagger-output.json";
const endpointsFiles = ["./src/index.router.js"]; // Main router file that includes all other routers

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc); 