import express from "express";
import dotenv from "dotenv";
import { bootstrap } from "./src/index.router.js";
import { connectDB } from "./DB/connection.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to database
try {
  await connectDB();
  console.log("DB connected successfully!");
} catch (error) {
  console.error("DB connection error:", error);
}

// Initialize routes and middleware
bootstrap(app, express);

// Documentation routes
app.get(["/", "/api-docs", "/api-docs/*"], (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling for 404
app.use((req, res, next) => {
  if (req.accepts("html")) {
    res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.status(404).json({ 
      status: 404,
      message: "Route not found",
      path: req.originalUrl
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (req.accepts("html")) {
    res.status(err.status || 500).sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.status(err.status || 500).json({
      status: err.status || 500,
      message: err.message || "Internal server error",
      path: req.originalUrl
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
  console.log(`API Documentation available at http://localhost:${port}`);
});
