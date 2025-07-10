import joi from "joi";
import { 
  SYSTEM_ROLES, 
  GRADE_LEVELS, 
  GOVERNORATES, 
  SUBJECTS,
  APP_CONFIG,
  VALIDATION_PATTERNS
} from "../../config/constants.js";

// Custom validation messages in Arabic
const customMessages = {
  'any.required': 'هذا الحقل مطلوب',
  'string.empty': 'هذا الحقل لا يمكن أن يكون فارغاً',
  'string.min': 'يجب أن يكون النص على الأقل {#limit} أحرف',
  'string.max': 'يجب أن يكون النص أقل من {#limit} حرف',
  'string.email': 'البريد الإلكتروني غير صحيح',
  'string.pattern.base': 'تنسيق البيانات غير صحيح',
  'any.only': 'القيمة المدخلة غير صحيحة',
  'string.length': 'يجب أن يكون النص {#limit} أحرف بالضبط'
};

// Custom validation for Arabic names
const arabicNameValidation = joi.string()
  .min(2)
  .max(20)
  .pattern(VALIDATION_PATTERNS.ARABIC_NAME)
  .messages({
    ...customMessages,
    'string.pattern.base': 'يجب أن يحتوي الاسم على أحرف عربية فقط'
  });

// Custom validation for email
const emailValidation = joi.string()
  .email()
  .lowercase()
  .trim()
  .messages({
    ...customMessages,
    'string.email': 'البريد الإلكتروني غير صحيح'
  });

// Custom validation for password
const passwordValidation = joi.string()
  .min(APP_CONFIG.SECURITY.PASSWORD_MIN_LENGTH)
  .messages({
    ...customMessages,
    'string.min': `كلمة المرور يجب أن تكون على الأقل ${APP_CONFIG.SECURITY.PASSWORD_MIN_LENGTH} أحرف`
  });

// Custom validation for phone
const phoneValidation = joi.string()
  .pattern(VALIDATION_PATTERNS.PHONE)
  .allow('')
  .messages({
    ...customMessages,
    'string.pattern.base': 'رقم الهاتف غير صحيح (يجب أن يكون رقم مصري صحيح)'
  });

// Sign up validation schema
export const signUpSchema = joi.object({
  firstName: arabicNameValidation.required(),
  lastName: arabicNameValidation.required(),
  email: emailValidation.required(),
  password: passwordValidation.required(),
  confirmPassword: joi.string()
    .valid(joi.ref('password'))
    .required()
    .messages({
      ...customMessages,
      'any.only': 'كلمة المرور وتأكيد كلمة المرور غير متطابقتان'
    }),
  phone: phoneValidation.optional(),
  governorate: joi.string()
    .valid(...GOVERNORATES)
    .required()
    .messages({
      ...customMessages,
      'any.only': 'المحافظة المختارة غير صحيحة'
    }),
  role: joi.string()
    .valid(SYSTEM_ROLES.USER, SYSTEM_ROLES.INSTRUCTOR)
    .required()
    .messages({
      ...customMessages,
      'any.only': 'نوع المستخدم غير صحيح'
    }),
  
  // Conditional validation based on role
  gradeLevel: joi.when('role', {
    is: SYSTEM_ROLES.USER,
    then: joi.string()
      .valid(...Object.values(GRADE_LEVELS))
      .required()
      .messages({
        ...customMessages,
        'any.only': 'المرحلة الدراسية المختارة غير صحيحة'
      }),
    otherwise: joi.forbidden()
  }),
  
  subject: joi.when('role', {
    is: SYSTEM_ROLES.INSTRUCTOR,
    then: joi.string()
      .valid(...SUBJECTS)
      .required()
      .messages({
        ...customMessages,
        'any.only': 'المادة الدراسية المختارة غير صحيحة'
      }),
    otherwise: joi.forbidden()
  })
}).messages(customMessages);

// Email confirmation validation schema
export const confirmEmailSchema = joi.object({
  token: joi.string()
    .required()
    .messages({
      ...customMessages,
      'any.required': 'رمز التفعيل مطلوب'
    })
}).messages(customMessages);

// Login validation schema
export const loginSchema = joi.object({
  email: emailValidation.required(),
  password: joi.string()
    .required()
    .messages({
      ...customMessages,
      'any.required': 'كلمة المرور مطلوبة'
    })
}).messages(customMessages);

// Forgot password validation schema
export const forgetPasswordSchema = joi.object({
  email: emailValidation.required()
}).messages(customMessages);

// Reset password validation schema
export const resetPasswordSchema = joi.object({
  email: emailValidation.required(),
  password: passwordValidation.required(),
  confirmPassword: joi.string()
    .valid(joi.ref('password'))
    .required()
    .messages({
      ...customMessages,
      'any.only': 'كلمة المرور وتأكيد كلمة المرور غير متطابقتان'
    }),
  forgetCode: joi.string()
    .length(5)
    .pattern(/^\d{5}$/)
    .required()
    .messages({
      ...customMessages,
      'string.length': 'رمز إعادة التعيين يجب أن يكون 5 أرقام',
      'string.pattern.base': 'رمز إعادة التعيين يجب أن يحتوي على أرقام فقط'
    })
}).messages(customMessages);

// Update profile validation schema
export const updateProfileSchema = joi.object({
  firstName: arabicNameValidation.optional(),
  lastName: arabicNameValidation.optional(),
  phone: phoneValidation.optional(),
  governorate: joi.string()
    .valid(...GOVERNORATES)
    .optional()
    .messages({
      ...customMessages,
      'any.only': 'المحافظة المختارة غير صحيحة'
    }),
  
  // Role-specific updates
  gradeLevel: joi.when('role', {
    is: SYSTEM_ROLES.USER,
    then: joi.string()
      .valid(...Object.values(GRADE_LEVELS))
      .optional()
      .messages({
        ...customMessages,
        'any.only': 'المرحلة الدراسية المختارة غير صحيحة'
      }),
    otherwise: joi.forbidden()
  }),
  
  subject: joi.when('role', {
    is: SYSTEM_ROLES.INSTRUCTOR,
    then: joi.string()
      .valid(...SUBJECTS)
      .optional()
      .messages({
        ...customMessages,
        'any.only': 'المادة الدراسية المختارة غير صحيحة'
      }),
    otherwise: joi.forbidden()
  })
}).messages(customMessages);

// Change password validation schema
export const changePasswordSchema = joi.object({
  currentPassword: joi.string()
    .required()
    .messages({
      ...customMessages,
      'any.required': 'كلمة المرور الحالية مطلوبة'
    }),
  newPassword: passwordValidation.required(),
  confirmNewPassword: joi.string()
    .valid(joi.ref('newPassword'))
    .required()
    .messages({
      ...customMessages,
      'any.only': 'كلمة المرور الجديدة وتأكيدها غير متطابقتان'
    })
}).messages(customMessages);

// Pagination validation schema
export const paginationSchema = joi.object({
  page: joi.number()
    .integer()
    .min(1)
    .default(APP_CONFIG.PAGINATION.DEFAULT_PAGE)
    .messages({
      ...customMessages,
      'number.min': 'رقم الصفحة يجب أن يكون أكبر من 0'
    }),
  limit: joi.number()
    .integer()
    .min(1)
    .max(APP_CONFIG.PAGINATION.MAX_LIMIT)
    .default(APP_CONFIG.PAGINATION.DEFAULT_LIMIT)
    .messages({
      ...customMessages,
      'number.min': 'عدد العناصر يجب أن يكون أكبر من 0',
      'number.max': `عدد العناصر لا يمكن أن يكون أكثر من ${APP_CONFIG.PAGINATION.MAX_LIMIT}`
    }),
  sort: joi.string()
    .valid('createdAt', '-createdAt', 'firstName', '-firstName', 'email', '-email')
    .default('-createdAt')
    .messages({
      ...customMessages,
      'any.only': 'طريقة الترتيب غير صحيحة'
    })
}).messages(customMessages);

// Search validation schema
export const searchSchema = joi.object({
  query: joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      ...customMessages,
      'string.min': 'كلمة البحث يجب أن تكون على الأقل حرفين',
      'string.max': 'كلمة البحث يجب أن تكون أقل من 100 حرف'
    }),
  role: joi.string()
    .valid(...Object.values(SYSTEM_ROLES))
    .optional()
    .messages({
      ...customMessages,
      'any.only': 'نوع المستخدم غير صحيح'
    }),
  governorate: joi.string()
    .valid(...GOVERNORATES)
    .optional()
    .messages({
      ...customMessages,
      'any.only': 'المحافظة المختارة غير صحيحة'
    }),
  gradeLevel: joi.string()
    .valid(...Object.values(GRADE_LEVELS))
    .optional()
    .messages({
      ...customMessages,
      'any.only': 'المرحلة الدراسية المختارة غير صحيحة'
    }),
  subject: joi.string()
    .valid(...SUBJECTS)
    .optional()
    .messages({
      ...customMessages,
      'any.only': 'المادة الدراسية المختارة غير صحيحة'
    })
}).messages(customMessages);

export default {
  signUpSchema,
  confirmEmailSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  paginationSchema,
  searchSchema
};
