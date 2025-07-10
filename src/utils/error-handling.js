import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { 
  AppError, 
  handleMongoError, 
  handleJWTError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  FileUploadError,
  DatabaseError
} from './error.class.js';

/**
 * Send error response in production
 */
const sendErrorProd = (err, req, res) => {
  // Log error for monitoring
  console.error('ERROR 💥:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      timestamp: err.timestamp
    };

    return res.status(err.statusCode).json(response);
  }

  // Programming or other unknown error: don't leak error details
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_ERROR,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, req, res) => {
  console.error('ERROR 💥:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  const response = {
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
    ...(err.errors && { errors: err.errors }),
    timestamp: err.timestamp || new Date().toISOString()
  };

  res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
};

/**
 * Handle specific error types and convert to operational errors
 */
const handleError = (err) => {
  let error = { ...err };

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError' || err.code === 11000) {
    error = handleMongoError(err);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    error = handleMongoError(err);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    error = handleMongoError(err);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new FileUploadError(ERROR_MESSAGES.FILE_TOO_LARGE);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new FileUploadError(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    const errors = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    error = new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR, errors);
  }

  return error;
};

/**
 * Global error handling middleware
 */
export const globalErrorHandling = (err, req, res, next) => {
  // Handle specific error types
  let error = handleError(err);

  // Ensure error has required properties
  if (!error.statusCode) {
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  if (!error.isOperational) {
    error.isOperational = false;
  }

  // Send appropriate response based on environment
  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(error, req, res);
  }
};

/**
 * Handle 404 errors for unmatched routes
 */
export const handleNotFound = (req, res, next) => {
  const error = new NotFoundError(`الصفحة ${req.originalUrl} غير موجودة`);
  next(error);
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service (e.g., Sentry, LogRocket, etc.)
      console.error('Uncaught Exception logged to external service');
    }
    
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
      console.error('Unhandled Rejection logged to external service');
    }
    
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
};

/**
 * Handle SIGTERM signal
 */
export const handleSIGTERM = (server) => {
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    
    if (server) {
      server.close(() => {
        console.log('💥 Process terminated!');
      });
    }
  });
};

/**
 * Create standardized API response
 */
export const createResponse = (success, data = null, message = null, statusCode = HTTP_STATUS.OK) => {
  const response = {
    success,
    timestamp: new Date().toISOString()
  };

  if (message) response.message = message;
  if (data) response.data = data;

  return { response, statusCode };
};

/**
 * Create success response
 */
export const createSuccessResponse = (data = null, message = null, statusCode = HTTP_STATUS.OK) => {
  return createResponse(true, data, message, statusCode);
};

/**
 * Create error response
 */
export const createErrorResponse = (message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  return createResponse(false, null, message, statusCode);
};

/**
 * Send success response
 */
export const sendSuccess = (res, data = null, message = null, statusCode = HTTP_STATUS.OK) => {
  const { response, statusCode: code } = createSuccessResponse(data, message, statusCode);
  return res.status(code).json(response);
};

/**
 * Send error response
 */
export const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  const { response, statusCode: code } = createErrorResponse(message, statusCode);
  return res.status(code).json(response);
};

export default {
  globalErrorHandling,
  handleNotFound,
  handleUncaughtException,
  handleUnhandledRejection,
  handleSIGTERM,
  createResponse,
  createSuccessResponse,
  createErrorResponse,
  sendSuccess,
  sendError
}; 