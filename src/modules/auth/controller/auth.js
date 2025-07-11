import userModel from "../../../../DB/models/user.model.js";
import tokenModel from "../../../../DB/models/token.model.js";
import jwt from "jsonwebtoken";
import randomstring from "randomstring";
import { uploadToCloudinary } from "../../../utils/cloud.js";
import { sendEmail } from "../../../utils/sendEmails.js";
import { resetPassword as resetPasswordTemplate, signupTemp } from "../../../utils/generateHtml.js";
import { 
  APP_CONFIG, 
  SYSTEM_ROLES, 
  USER_STATUS, 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES,
  HTTP_STATUS
} from "../../../config/constants.js";
import { 
  catchAsync,
  AppError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
  FileUploadError
} from "../../../utils/error.class.js";
import { sendSuccess } from "../../../utils/error-handling.js";

/**
 * Helper function to generate JWT token
 */
const generateJWTToken = (payload, secret = APP_CONFIG.JWT.SECRET, expiresIn = APP_CONFIG.JWT.EXPIRES_IN) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Helper function to create and save authentication token
 */
const createAuthToken = async (user, req) => {
  const tokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const token = generateJWTToken(tokenPayload);
  
  // Extract device and location information
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
  
  // Create token record
  await tokenModel.create({
    token,
    user: user._id,
    agent: userAgent,
    ipAddress,
    tokenType: 'access',
    deviceInfo: userAgent
  });

  // Update user login status
  user.isLoggedIn = true;
  user.lastLogin = new Date();
  user.lastActivity = new Date();
  
  // Reset login attempts on successful login
  await user.resetLoginAttempts();
  await user.save();

  return token;
};

/**
 * Helper function to upload instructor document
 */
const uploadInstructorDocument = async (file, user) => {
  try {
    const folderPath = `${APP_CONFIG.UPLOAD.CLOUDINARY_FOLDER}/documents/${user.firstName}_${user.lastName}`;
    const result = await uploadToCloudinary(file, {
      folder: folderPath,
      resource_type: 'auto',
    });
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Failed to upload instructor document:', error.message);
    throw new FileUploadError(ERROR_MESSAGES.UPLOAD_FAILED);
  }
};

/**
 * Helper function to send confirmation email
 */
const sendConfirmationEmail = async (user, req) => {
  try {
    const confirmationToken = generateJWTToken(
      { id: user._id }, 
      APP_CONFIG.JWT.CONFIRMATION_SECRET, 
      APP_CONFIG.JWT.CONFIRMATION_EXPIRES_IN
    );
    
    const confirmationLink = `${req.protocol}://${req.headers.host}/api/v1/auth/confirm-email/${confirmationToken}`;
    
    const emailSent = await sendEmail({
      to: user.email,
      subject: APP_CONFIG.EMAIL.CONFIRMATION_SUBJECT,
      html: signupTemp(confirmationLink),
    });

    if (!emailSent) {
      throw new Error('Failed to send confirmation email');
    }
  } catch (error) {
    console.error('Failed to send confirmation email:', error.message);
    throw new AppError(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * User Registration
 */
export const signUp = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role, phone, governorate, gradeLevel, subject } = req.body;

  // Check if user already exists
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return next(new ConflictError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS));
  }

  // Validate instructor document requirement
  if (role === SYSTEM_ROLES.INSTRUCTOR && !req.file) {
    return next(new ValidationError(ERROR_MESSAGES.FILE_REQUIRED));
  }

  // Prepare user data
  const userData = {
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    governorate,
  };

  // Add role-specific fields
  if (role === SYSTEM_ROLES.USER) {
    userData.gradeLevel = gradeLevel;
  }

  if (role === SYSTEM_ROLES.INSTRUCTOR) {
    userData.subject = subject;
    userData.status = USER_STATUS.PENDING;
  }

  // Create user
  const user = await userModel.create(userData);

  // Upload instructor document if provided
  if (role === SYSTEM_ROLES.INSTRUCTOR && req.file) {
    const document = await uploadInstructorDocument(req.file, user);
    user.document = document;
    await user.save();
  }

  // Send confirmation email
  try {
    await sendConfirmationEmail(user, req);
  } catch (emailError) {
    console.error("Failed to send confirmation email:", emailError);
    // We don't block registration if email fails.
    // The user can request a new confirmation email later.
  }

  // Send success response
  sendSuccess(res, null, SUCCESS_MESSAGES.REGISTRATION_SUCCESS, HTTP_STATUS.CREATED);
});

/**
 * Email Confirmation
 */
export const confirmEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, APP_CONFIG.JWT.CONFIRMATION_SECRET);
    
    if (!decoded?.id) {
      return next(new AuthenticationError(ERROR_MESSAGES.TOKEN_INVALID));
    }

    const user = await userModel.findByIdAndUpdate(
      decoded.id,
      { isConfirmed: true },
      { new: true }
    );

    if (!user) {
      return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
    }

    // Send HTML response for email confirmation
    res.status(HTTP_STATUS.OK).send(`