import jwt from "jsonwebtoken";
import tokenModel from "../../DB/models/token.model.js";
import userModel from "../../DB/models/user.model.js";
import { APP_CONFIG, ERROR_MESSAGES } from "../config/constants.js";
import { catchAsync, AuthenticationError, NotFoundError } from "../utils/error.class.js";

/**
 * Authentication middleware
 */
export const isAuthenticated = catchAsync(async (req, res, next) => {
  // Get token from header
  let token = req.headers.authorization;

  if (!token || !token.startsWith(APP_CONFIG.JWT.BEARER_PREFIX)) {
    return next(new AuthenticationError(ERROR_MESSAGES.TOKEN_REQUIRED));
  }

  // Extract token
  token = token.replace(APP_CONFIG.JWT.BEARER_PREFIX, '');

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, APP_CONFIG.JWT.SECRET);
    
    if (!decoded || !decoded.id) {
      return next(new AuthenticationError(ERROR_MESSAGES.TOKEN_INVALID));
    }

    // Check if token exists in database and is valid
    const tokenRecord = await tokenModel.findOne({ 
      token, 
      isValid: true,
      expiresAt: { $gt: new Date() }
    });

    if (!tokenRecord) {
      return next(new AuthenticationError(ERROR_MESSAGES.TOKEN_EXPIRED));
    }

    // Find user
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
    }

    // Check if user is confirmed
    if (!user.isConfirmed) {
      return next(new AuthenticationError(ERROR_MESSAGES.EMAIL_NOT_CONFIRMED));
    }

    // Check if user account is locked
    if (user.isLocked) {
      return next(new AuthenticationError(ERROR_MESSAGES.ACCOUNT_SUSPENDED));
    }

    // Update last activity
    user.lastActivity = new Date();
    await user.save();

    // Update token last used
    tokenRecord.lastUsed = new Date();
    await tokenRecord.save();

    // Attach user and token to request
    req.user = user;
    req.token = token;
    req.tokenRecord = tokenRecord;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError(ERROR_MESSAGES.TOKEN_INVALID));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError(ERROR_MESSAGES.TOKEN_EXPIRED));
    }
    
    return next(new AuthenticationError(ERROR_MESSAGES.TOKEN_INVALID));
  }
});

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || !token.startsWith(APP_CONFIG.JWT.BEARER_PREFIX)) {
    return next();
  }

  try {
    // Use the same logic as isAuthenticated but don't fail
    await isAuthenticated(req, res, () => {});
  } catch (error) {
    // Ignore auth errors for optional auth
  }

  next();
});

/**
 * Middleware to check if user is confirmed
 */
export const requireConfirmedEmail = catchAsync(async (req, res, next) => {
  if (!req.user.isConfirmed) {
    return next(new AuthenticationError(ERROR_MESSAGES.EMAIL_NOT_CONFIRMED));
  }
  next();
});

/**
 * Middleware to check if user profile is complete
 */
export const requireCompleteProfile = catchAsync(async (req, res, next) => {
  if (!req.user.profileComplete) {
    return next(new AuthenticationError('يرجى إكمال ملفك الشخصي أولاً'));
  }
  next();
});

/**
 * Middleware to refresh token if it's about to expire
 */
export const refreshTokenIfNeeded = catchAsync(async (req, res, next) => {
  if (req.tokenRecord) {
    const timeUntilExpiry = req.tokenRecord.expiresAt - new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    // If token expires in less than 24 hours, refresh it
    if (timeUntilExpiry < oneDayInMs) {
      await req.tokenRecord.refresh();
    }
  }
  next();
});

export default {
  isAuthenticated,
  optionalAuth,
  requireConfirmedEmail,
  requireCompleteProfile,
  refreshTokenIfNeeded
};
