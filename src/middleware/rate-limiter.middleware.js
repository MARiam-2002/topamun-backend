import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../utils/error.class.js';

// Store for rate limiting (in production, use Redis)
const store = new Map();

/**
 * Custom rate limit store using Map (for development)
 * In production, use Redis store
 */
const customStore = {
  incr: (key, cb) => {
    const current = store.get(key) || { count: 0, resetTime: Date.now() + 60000 };
    
    if (Date.now() > current.resetTime) {
      current.count = 1;
      current.resetTime = Date.now() + 60000;
    } else {
      current.count++;
    }
    
    store.set(key, current);
    cb(null, current.count, current.resetTime);
  },
  
  decrement: (key) => {
    const current = store.get(key);
    if (current && current.count > 0) {
      current.count--;
      store.set(key, current);
    }
  },
  
  resetKey: (key) => {
    store.delete(key);
  }
};

/**
 * Create rate limiter with custom error handling
 */
const createRateLimiter = (options) => {
  const limiter = rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: options.message || 'تم تجاوز الحد المسموح من الطلبات',
    standardHeaders: true,
    legacyHeaders: false,
    store: customStore,
    keyGenerator: (req) => {
      // Use IP address and user ID if available
      return req.user ? `${req.ip}-${req.user._id}` : req.ip;
    },
    handler: (req, res, next) => {
      return next(new RateLimitError(options.message || 'تم تجاوز الحد المسموح من الطلبات'));
    },
    skip: (req) => {
      // Skip rate limiting for admin users
      return req.user && req.user.role === 'admin';
    }
  });

  return limiter;
};

/**
 * General API rate limiter
 */
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً'
});

/**
 * Authentication rate limiters
 */
export const rateLimiter = {
  // Registration rate limiter
  registration: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registration attempts per hour
    message: 'تم تجاوز الحد المسموح من محاولات التسجيل. يرجى المحاولة بعد ساعة'
  }),

  // Login rate limiter
  login: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per 15 minutes
    message: 'تم تجاوز الحد المسموح من محاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة'
  }),

  // Password reset rate limiter
  forgotPassword: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: 'تم تجاوز الحد المسموح من محاولات إعادة تعيين كلمة المرور. يرجى المحاولة بعد ساعة'
  }),

  // Reset password rate limiter
  resetPassword: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 reset attempts per 15 minutes
    message: 'تم تجاوز الحد المسموح من محاولات إعادة تعيين كلمة المرور. يرجى المحاولة بعد 15 دقيقة'
  }),

  // Email confirmation rate limiter
  emailConfirmation: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 confirmation attempts per hour
    message: 'تم تجاوز الحد المسموح من محاولات تفعيل البريد الإلكتروني. يرجى المحاولة بعد ساعة'
  })
};

/**
 * API endpoint rate limiters
 */
export const apiLimiter = {
  // File upload rate limiter
  fileUpload: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 file uploads per hour
    message: 'تم تجاوز الحد المسموح من رفع الملفات. يرجى المحاولة بعد ساعة'
  }),

  // Search rate limiter
  search: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 search requests per minute
    message: 'تم تجاوز الحد المسموح من عمليات البحث. يرجى المحاولة بعد دقيقة'
  }),

  // Profile update rate limiter
  profileUpdate: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 profile updates per hour
    message: 'تم تجاوز الحد المسموح من تحديث الملف الشخصي. يرجى المحاولة بعد ساعة'
  }),

  // Admin operations rate limiter
  adminOperations: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 admin operations per hour
    message: 'تم تجاوز الحد المسموح من العمليات الإدارية. يرجى المحاولة بعد ساعة'
  })
};

/**
 * Strict rate limiter for sensitive operations
 */
export const strictLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 attempts per day
  message: 'تم تجاوز الحد المسموح من هذه العملية. يرجى المحاولة غداً'
});

/**
 * Progressive rate limiter that increases delay
 */
export const progressiveLimiter = (baseDelay = 1000) => {
  const delays = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const currentDelay = delays.get(key) || 0;
    
    if (currentDelay > 0) {
      setTimeout(() => {
        delays.set(key, Math.min(currentDelay * 2, 60000)); // Max 60 seconds
        next();
      }, currentDelay);
    } else {
      delays.set(key, baseDelay);
      next();
    }
  };
};

/**
 * IP-based rate limiter
 */
export const ipLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per 15 minutes
  message: 'تم تجاوز الحد المسموح من الطلبات لهذا العنوان. يرجى المحاولة لاحقاً'
});

/**
 * User-based rate limiter (requires authentication)
 */
export const userLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per user per hour
  message: 'تم تجاوز الحد المسموح من الطلبات لحسابك. يرجى المحاولة بعد ساعة',
  keyGenerator: (req) => {
    return req.user ? `user-${req.user._id}` : req.ip;
  }
});

/**
 * Cleanup function to remove expired entries
 */
export const cleanupExpiredEntries = () => {
  const now = Date.now();
  
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
};

// Clean up expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

export default {
  generalLimiter,
  rateLimiter,
  apiLimiter,
  strictLimiter,
  progressiveLimiter,
  ipLimiter,
  userLimiter,
  cleanupExpiredEntries
}; 