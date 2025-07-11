import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";

// Check if Cloudinary configuration is available
const hasCloudinaryConfig = process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET;

if (!hasCloudinaryConfig) {
  console.warn('⚠️  Cloudinary configuration missing. File uploads will be disabled.');
  console.warn('   Required variables: CLOUD_NAME, API_KEY, API_SECRET');
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || 'dummy',
  api_key: process.env.API_KEY || 'dummy',
  api_secret: process.env.API_SECRET || 'dummy',
});

// Export a wrapper that checks configuration before uploading
export const uploadToCloudinary = async (filePath, options = {}) => {
  if (!hasCloudinaryConfig) {
    throw new Error('Cloudinary configuration is missing. Cannot upload files.');
  }
  
  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    console.log('✅ File uploaded to Cloudinary:', result.public_id);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    throw error;
  }
};

export default cloudinary;
