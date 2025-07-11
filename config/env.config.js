import dotenv from "dotenv";
import path from "path";

// Set environment variables for development if not already set
if (!process.env.CONNECTION_URL) {
  // Use a local MongoDB instance for development
  // If you don't have MongoDB locally, you can use MongoDB Atlas free tier
  process.env.CONNECTION_URL = "mongodb://localhost:27017/topamun-dev";
}

if (!process.env.TOKEN_KEY) {
  process.env.TOKEN_KEY = "your-super-secret-jwt-token-key-for-topamun-platform-2024";
}

if (!process.env.JWT_SECRET_CONFIRMATION) {
  process.env.JWT_SECRET_CONFIRMATION = "your-super-secret-confirmation-token-key-for-topamun-platform-2024";
}

if (!process.env.BEARER_KEY) {
  process.env.BEARER_KEY = "Bearer ";
}

if (!process.env.SALT_ROUND) {
  process.env.SALT_ROUND = "12";
}

if (!process.env.EMAIL) {
  process.env.EMAIL = "topamun.platform@gmail.com";
}

if (!process.env.EMAIL_PASSWORD) {
  process.env.EMAIL_PASSWORD = "dummy-password";
}

if (!process.env.EMAIL_FROM) {
  process.env.EMAIL_FROM = '"Topamun Platform" <topamun.platform@gmail.com>';
}

if (!process.env.CLOUD_NAME) {
  process.env.CLOUD_NAME = "dummy-cloud-name";
}

if (!process.env.API_KEY) {
  process.env.API_KEY = "dummy-api-key";
}

if (!process.env.API_SECRET) {
  process.env.API_SECRET = "dummy-api-secret";
}

if (!process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL = "http://localhost:3000";
}

if (!process.env.API_BASE_URL) {
  process.env.API_BASE_URL = "http://localhost:3000/api/v1";
}

// Try to load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') }); 