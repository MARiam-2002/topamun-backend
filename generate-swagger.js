import fs from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'توثيق API منصة توبامين التعليمية',
      version: '1.0.0',
      description: 'دليل شامل لجميع واجهات برمجة التطبيقات (API) الخاصة بمنصة توبامين التعليمية.',
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://topamun-backend.vercel.app/api/v1',
        description: 'خادم الإنتاج'
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: 'خادم التطوير المحلي'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'أدخل الرمز المميز الذي حصلت عليه من تسجيل الدخول'
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
    tags: [
      {
        name: 'Authentication',
        description: 'عمليات التوثيق والأمان - تسجيل الدخول، الخروج، إدارة الجلسات وكلمات المرور.',
        externalDocs: {
          description: 'المزيد عن نظام التوثيق',
          url: 'https://topamun.com/docs/auth'
        }
      },
      {
        name: 'Users',
        description: 'عمليات إدارة المستخدمين - عرض وتعديل الملفات الشخصية، إدارة المستخدمين من قبل المشرفين، وعرض الإحصائيات.'
      }
    ]
  },
  apis: [
    path.resolve(process.cwd(), './src/modules/auth/auth.router.js'),
    path.resolve(process.cwd(), './src/modules/user/user.router.js')
  ],
};

try {
  const swaggerSpec = swaggerJSDoc(options);
  
  // Add custom examples and enhanced descriptions
  swaggerSpec.components.examples = {
    StudentSignup: {
      summary: 'تسجيل طالب جديد',
      description: 'مثال على تسجيل طالب في المرحلة الثانوية من محافظة القاهرة',
      value: {
        firstName: 'أحمد',
        lastName: 'محمد',
        email: 'ahmed.mohamed@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        phone: '01234567890',
        role: 'user',
        governorate: 'القاهرة',
        gradeLevel: 'المرحلة الثانوية'
      }
    },
    InstructorSignup: {
      summary: 'تسجيل معلم جديد',
      description: 'مثال على تسجيل معلم رياضيات (يتطلب رفع وثيقة)',
      value: {
        firstName: 'فاطمة',
        lastName: 'زهراء',
        email: 'fatma.zahra@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        phone: '01234567891',
        role: 'instructor',
        governorate: 'الجيزة',
        subject: 'الرياضيات'
      }
    },
    LoginExample: {
      summary: 'تسجيل دخول مستخدم',
      description: 'مثال على تسجيل الدخول بالبريد الإلكتروني وكلمة المرور',
      value: {
        email: 'ahmed.mohamed@example.com',
        password: 'SecurePassword123!'
      }
    },
    ForgotPasswordExample: {
      summary: 'طلب إعادة تعيين كلمة المرور',
      description: 'إرسال رمز إعادة التعيين للبريد الإلكتروني',
      value: {
        email: 'ahmed.mohamed@example.com'
      }
    },
    ResetPasswordExample: {
      summary: 'إعادة تعيين كلمة المرور',
      description: 'استخدام الرمز المُرسل لإعادة تعيين كلمة المرور',
      value: {
        email: 'ahmed.mohamed@example.com',
        forgetCode: '12345',
        password: 'NewSecurePassword123!',
        confirmPassword: 'NewSecurePassword123!'
      }
    }
  };

  // Enhanced error responses
  swaggerSpec.components.responses = {
    ...swaggerSpec.components.responses,
    ValidationError: {
      description: 'خطأ في التحقق من صحة البيانات',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'خطأ في التحقق من صحة البيانات' },
              errors: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'يجب أن يكون البريد الإلكتروني صحيحاً' }
                  }
                }
              }
            }
          }
        }
      }
    },
    UnauthorizedError: {
      description: 'غير مصرح - الرمز المميز مطلوب أو غير صحيح',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'الرمز المميز مطلوب أو غير صحيح' }
            }
          }
        }
      }
    },
    ForbiddenError: {
      description: 'ممنوع - لا تملك الصلاحية للوصول',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'لا تملك الصلاحية للوصول لهذا المورد' }
            }
          }
        }
      }
    },
    NotFoundError: {
      description: 'غير موجود - المورد المطلوب غير موجود',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'المورد المطلوب غير موجود' }
            }
          }
        }
      }
    },
    ServerError: {
      description: 'خطأ في الخادم',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً' }
            }
          }
        }
      }
    }
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), './swagger-spec.json'),
    JSON.stringify(swaggerSpec, null, 2)
  );
  console.log('✅ تم إنشاء توثيق API بنجاح مع التحسينات الجديدة');
  console.log('🎨 التوثيق يحتوي على تصميم مخصص يتناسب مع ألوان الموقع');
  console.log('📚 تم إضافة أمثلة شاملة وحالات استخدام متنوعة');
} catch (error) {
  console.error('❌ خطأ في إنشاء توثيق API:', error);
  process.exit(1);
} 