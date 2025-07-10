import fs from 'fs';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'توثيق API منصة توبامين التعليمية',
      version: '1.0.0',
      description: `
        <div style="background: #E8F4FD; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4A90E2;">
          <h3 style="color: #2C5AA0; margin-top: 0; margin-bottom: 15px;">📋 نظرة عامة على النظام</h3>
          <p>منصة توبامين هي منصة تعليمية شاملة تدعم ثلاثة أنواع من المستخدمين:</p>
          <ul style="margin: 10px 0; padding-right: 20px;">
            <li><strong>الطلاب (Students):</strong> يمكنهم التسجيل وتحديد المرحلة الدراسية والمحافظة.</li>
            <li><strong>المعلمين (Instructors):</strong> يحتاجون لرفع وثائق التأهيل وانتظار الموافقة من الإدارة.</li>
            <li><strong>المديرين (Admins):</strong> يديرون النظام ويوافقون على طلبات المعلمين.</li>
          </ul>
        </div>

        <div style="background: #FFF3CD; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
          <h3 style="color: #D97706; margin-top: 0; margin-bottom: 15px;">🔐 آلية التوثيق</h3>
          <p>يستخدم النظام JWT (JSON Web Tokens) للتوثيق مع الخصائص التالية:</p>
          <ul style="margin: 10px 0; padding-right: 20px;">
            <li>مدة صلاحية الرمز: 7 أيام.</li>
            <li>يجب إرسال الرمز في header: <code>Authorization: Bearer YOUR_TOKEN</code>.</li>
            <li>يتم إنشاء الرمز عند تسجيل الدخول بنجاح.</li>
            <li>يتم إلغاء جميع الرموز عند إعادة تعيين كلمة المرور.</li>
          </ul>
        </div>

        <div style="background: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
          <h3 style="color: #059669; margin-top: 0; margin-bottom: 15px;">🚀 البدء السريع</h3>
          <p>لبدء استخدام API، اتبع هذه الخطوات:</p>
          <ol style="margin: 10px 0; padding-right: 20px;">
            <li>قم بتسجيل حساب جديد باستخدام <code>POST /auth/signup</code>.</li>
            <li>تحقق من بريدك الإلكتروني واضغط على رابط التفعيل.</li>
            <li>سجل دخولك باستخدام <code>POST /auth/login</code>.</li>
            <li>استخدم الرمز المُرجع في جميع الطلبات المحمية.</li>
          </ol>
        </div>

        <div style="background: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <h3 style="color: #DC2626; margin-top: 0; margin-bottom: 15px;">⚠️ ملاحظات مهمة</h3>
          <ul style="margin: 10px 0; padding-right: 20px;">
            <li>جميع الطلبات يجب أن تكون بصيغة JSON ما عدا رفع الملفات.</li>
            <li>المعلمون يحتاجون لرفع وثيقة تأهيل (PDF أو صورة) عند التسجيل.</li>
            <li>يجب تفعيل البريد الإلكتروني قبل تسجيل الدخول.</li>
            <li>المعلمون يحتاجون موافقة الإدارة قبل تسجيل الدخول.</li>
          </ul>
        </div>
      `,
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