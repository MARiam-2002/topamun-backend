import { ValidationError } from "../utils/error.class.js";
import { catchAsync } from "../utils/error.class.js";

/**
 * Validation middleware
 * @param {Object} schema - Joi validation schema
 * @param {Array} sources - Array of request sources to validate ['body', 'params', 'query', 'headers']
 */
export const validation = (schema, sources = ['body']) => {
  return catchAsync(async (req, res, next) => {
    const validationErrors = [];

    // Validate each specified source
    for (const source of sources) {
      const dataToValidate = req[source];
      
      if (dataToValidate && Object.keys(dataToValidate).length > 0) {
        const { error } = schema.validate(dataToValidate, { 
          abortEarly: false, // Show all errors
          allowUnknown: false, // Don't allow unknown fields
          stripUnknown: true // Remove unknown fields
        });

        if (error) {
          const sourceErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            source: source
          }));
          
          validationErrors.push(...sourceErrors);
        }
      }
    }

    // If there are validation errors, throw ValidationError
    if (validationErrors.length > 0) {
      return next(new ValidationError('خطأ في التحقق من صحة البيانات', validationErrors));
    }

    next();
  });
};

/**
 * Validate request body only
 */
export const validateBody = (schema) => validation(schema, ['body']);

/**
 * Validate request params only
 */
export const validateParams = (schema) => validation(schema, ['params']);

/**
 * Validate request query only
 */
export const validateQuery = (schema) => validation(schema, ['query']);

/**
 * Validate request headers only
 */
export const validateHeaders = (schema) => validation(schema, ['headers']);

/**
 * Validate multiple sources
 */
export const validateMultiple = (schemas) => {
  return catchAsync(async (req, res, next) => {
    const validationErrors = [];

    // Validate each schema for its corresponding source
    for (const [source, schema] of Object.entries(schemas)) {
      const dataToValidate = req[source];
      
      if (dataToValidate && Object.keys(dataToValidate).length > 0) {
        const { error } = schema.validate(dataToValidate, { 
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        });

        if (error) {
          const sourceErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            source: source
          }));
          
          validationErrors.push(...sourceErrors);
        }
      }
    }

    if (validationErrors.length > 0) {
      return next(new ValidationError('خطأ في التحقق من صحة البيانات', validationErrors));
    }

    next();
  });
};

/**
 * Optional validation - doesn't fail if data is missing
 */
export const optionalValidation = (schema, sources = ['body']) => {
  return catchAsync(async (req, res, next) => {
    const validationErrors = [];

    for (const source of sources) {
      const dataToValidate = req[source];
      
      // Only validate if data exists
      if (dataToValidate && Object.keys(dataToValidate).length > 0) {
        const { error } = schema.validate(dataToValidate, { 
          abortEarly: false,
          allowUnknown: true, // Allow unknown fields for optional validation
          stripUnknown: false // Don't strip unknown fields
        });

        if (error) {
          const sourceErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            source: source
          }));
          
          validationErrors.push(...sourceErrors);
        }
      }
    }

    if (validationErrors.length > 0) {
      return next(new ValidationError('خطأ في التحقق من صحة البيانات', validationErrors));
    }

    next();
  });
};

/**
 * Validate file upload
 */
export const validateFileUpload = (options = {}) => {
  const {
    required = false,
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxSize = 5 * 1024 * 1024, // 5MB
    fieldName = 'file'
  } = options;

  return catchAsync(async (req, res, next) => {
    const file = req.file || req.files?.[fieldName];

    // Check if file is required
    if (required && !file) {
      return next(new ValidationError('الملف مطلوب'));
    }

    // If file exists, validate it
    if (file) {
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return next(new ValidationError(`نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedTypes.join(', ')}`));
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return next(new ValidationError(`حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB`));
      }
    }

    next();
  });
};

/**
 * Sanitize input data
 */
export const sanitizeInput = (sources = ['body']) => {
  return catchAsync(async (req, res, next) => {
    for (const source of sources) {
      const data = req[source];
      
      if (data && typeof data === 'object') {
        // Recursively sanitize object
        req[source] = sanitizeObject(data);
      }
    }

    next();
  });
};

/**
 * Helper function to sanitize object
 */
const sanitizeObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Trim whitespace and remove potential XSS
        sanitized[key] = value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  return obj;
};

export default {
  validation,
  validateBody,
  validateParams,
  validateQuery,
  validateHeaders,
  validateMultiple,
  optionalValidation,
  validateFileUpload,
  sanitizeInput
};
