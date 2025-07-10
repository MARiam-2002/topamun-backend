import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Base Application Error Class
 */
export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error Class
 */
export class ValidationError extends AppError {
  constructor(message = ERROR_MESSAGES.VALIDATION_ERROR, errors = []) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error Class
 */
export class AuthenticationError extends AppError {
  constructor(message = ERROR_MESSAGES.INVALID_CREDENTIALS) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error Class
 */
export class AuthorizationError extends AppError {
  constructor(message = ERROR_MESSAGES.FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error Class
 */
export class NotFoundError extends AppError {
  constructor(message = ERROR_MESSAGES.NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error Class
 */
export class ConflictError extends AppError {
  constructor(message = ERROR_MESSAGES.EMAIL_ALREADY_EXISTS) {
    super(message, HTTP_STATUS.CONFLICT);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error Class
 */
export class RateLimitError extends AppError {
  constructor(message = ERROR_MESSAGES.TOO_MANY_REQUESTS) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS);
    this.name = 'RateLimitError';
  }
}

/**
 * File Upload Error Class
 */
export class FileUploadError extends AppError {
  constructor(message = ERROR_MESSAGES.UPLOAD_FAILED) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.name = 'FileUploadError';
  }
}

/**
 * Database Error Class
 */
export class DatabaseError extends AppError {
  constructor(message = ERROR_MESSAGES.INTERNAL_ERROR) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    this.name = 'DatabaseError';
  }
}

/**
 * Create validation error with field details
 */
export const createValidationError = (field, message) => {
  return new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR, [
    { field, message }
  ]);
};

/**
 * Create authentication error with specific message
 */
export const createAuthError = (message) => {
  return new AuthenticationError(message);
};

/**
 * Create not found error with specific resource
 */
export const createNotFoundError = (resource) => {
  return new NotFoundError(`${resource} غير موجود`);
};

/**
 * Handle async errors wrapper
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle specific MongoDB errors
 */
export const handleMongoError = (error) => {
  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyValue)[0];
    const message = field === 'email' ? ERROR_MESSAGES.EMAIL_ALREADY_EXISTS : `${field} مستخدم بالفعل`;
    return new ConflictError(message);
  }
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    return new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR, errors);
  }
  
  if (error.name === 'CastError') {
    return new ValidationError(`معرف غير صحيح: ${error.value}`);
  }
  
  return new DatabaseError(ERROR_MESSAGES.INTERNAL_ERROR);
};

/**
 * Handle JWT errors
 */
export const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError(ERROR_MESSAGES.TOKEN_INVALID);
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError(ERROR_MESSAGES.TOKEN_EXPIRED);
  }
  
  return new AuthenticationError(ERROR_MESSAGES.TOKEN_INVALID);
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  FileUploadError,
  DatabaseError,
  createValidationError,
  createAuthError,
  createNotFoundError,
  catchAsync,
  handleMongoError,
  handleJWTError,
}; 