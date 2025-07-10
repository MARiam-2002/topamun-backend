// Application Constants
export const APP_CONFIG = {
  // JWT Configuration
  JWT: {
    SECRET: process.env.TOKEN_KEY || 'topamun_secret_key',
    CONFIRMATION_SECRET: process.env.JWT_SECRET_CONFIRMATION || 'topamun_confirmation_secret',
    EXPIRES_IN: '7d',
    CONFIRMATION_EXPIRES_IN: '1h',
    BEARER_PREFIX: process.env.BEARER_KEY || 'Bearer ',
  },

  // Database Configuration
  DATABASE: {
    CONNECTION_URL: process.env.CONNECTION_URL,
    CONNECTION_TIMEOUT: parseInt(process.env.MONGODB_CONNECTION_TIMEOUT) || 30000,
    SOCKET_TIMEOUT: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 60000,
    SERVER_SELECTION_TIMEOUT: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 30000,
    MAX_RETRY_ATTEMPTS: parseInt(process.env.MONGODB_MAX_RETRY_ATTEMPTS) || 5,
    BASE_RETRY_DELAY: parseInt(process.env.MONGODB_BASE_RETRY_DELAY) || 1000,
  },

  // Security Configuration
  SECURITY: {
    SALT_ROUNDS: parseInt(process.env.SALT_ROUND) || 12,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
    PASSWORD_MIN_LENGTH: 8,
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
    CLOUDINARY_FOLDER: 'topamun',
  },

  // Email Configuration
  EMAIL: {
    FROM: process.env.EMAIL_FROM || 'noreply@topamun.com',
    CONFIRMATION_SUBJECT: 'تفعيل حساب توبامين',
    RESET_PASSWORD_SUBJECT: 'إعادة تعيين كلمة المرور',
  },

  // Application URLs
  URLS: {
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // requests per window
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    AUTH_MAX_REQUESTS: 5, // login attempts per window
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Cache Configuration
  CACHE: {
    TTL: 60 * 60, // 1 hour in seconds
    USER_PROFILE_TTL: 30 * 60, // 30 minutes
    AUTH_TOKEN_TTL: 24 * 60 * 60, // 24 hours
  },
};

// System Roles
export const SYSTEM_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
};

// User Status
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

// Grade Levels
export const GRADE_LEVELS = {
  PRIMARY: 'المرحلة الابتدائية',
  PREPARATORY: 'المرحلة الإعدادية',
  SECONDARY: 'المرحلة الثانوية',
};

// Governorates (المحافظات)
export const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الشرقية',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
];

// Subjects (المواد الدراسية)
export const SUBJECTS = [
  'الرياضيات',
  'الفيزياء',
  'الكيمياء',
  'الأحياء',
  'اللغة العربية',
  'اللغة الإنجليزية',
  'اللغة الفرنسية',
  'التاريخ',
  'الجغرافيا',
  'الفلسفة والمنطق',
  'علم النفس والاجتماع',
  'الاقتصاد والإحصاء',
  'الحاسب الآلي',
  'التربية الدينية',
  'التربية الوطنية',
];

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication Errors
  INVALID_CREDENTIALS: 'بيانات الاعتماد غير صحيحة',
  EMAIL_NOT_CONFIRMED: 'يرجى تفعيل بريدك الإلكتروني أولاً',
  ACCOUNT_SUSPENDED: 'تم تعليق حسابك، يرجى التواصل مع الإدارة',
  TOKEN_REQUIRED: 'الرمز المميز مطلوب',
  TOKEN_INVALID: 'الرمز المميز غير صحيح',
  TOKEN_EXPIRED: 'انتهت صلاحية الرمز المميز',
  
  // User Errors
  USER_NOT_FOUND: 'المستخدم غير موجود',
  EMAIL_ALREADY_EXISTS: 'البريد الإلكتروني مستخدم بالفعل',
  INSTRUCTOR_PENDING: 'حسابك في انتظار موافقة الإدارة',
  INSTRUCTOR_REJECTED: 'تم رفض حسابك من قبل الإدارة',
  
  // Validation Errors
  VALIDATION_ERROR: 'خطأ في التحقق من صحة البيانات',
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  PASSWORD_TOO_SHORT: 'كلمة المرور قصيرة جداً',
  PASSWORDS_NOT_MATCH: 'كلمات المرور غير متطابقة',
  
  // File Upload Errors
  FILE_REQUIRED: 'الملف مطلوب',
  FILE_TOO_LARGE: 'حجم الملف كبير جداً',
  INVALID_FILE_TYPE: 'نوع الملف غير مدعوم',
  UPLOAD_FAILED: 'فشل في رفع الملف',
  
  // General Errors
  INTERNAL_ERROR: 'حدث خطأ داخلي في الخادم',
  NOT_FOUND: 'المورد المطلوب غير موجود',
  FORBIDDEN: 'ليس لديك صلاحية للوصول',
  TOO_MANY_REQUESTS: 'عدد كبير من الطلبات، يرجى المحاولة لاحقاً',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'تم التسجيل بنجاح. يرجى فحص بريدك الإلكتروني لتفعيل الحساب',
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
  EMAIL_CONFIRMED: 'تم تفعيل حسابك بنجاح',
  PASSWORD_RESET_SENT: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
  PASSWORD_RESET_SUCCESS: 'تم إعادة تعيين كلمة المرور بنجاح',
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
  FILE_UPLOADED: 'تم رفع الملف بنجاح',
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^01[0-2,5]{1}[0-9]{8}$/, // Egyptian phone numbers
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, // Strong password
  ARABIC_NAME: /^[\u0600-\u06FF\s]+$/, // Arabic characters only
};

export default {
  APP_CONFIG,
  SYSTEM_ROLES,
  USER_STATUS,
  GRADE_LEVELS,
  GOVERNORATES,
  SUBJECTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_PATTERNS,
}; 