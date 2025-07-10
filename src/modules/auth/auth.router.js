import { Router } from "express";
import * as Validators from "./auth.validation.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as authController from "./controller/auth.js";
import { fileUpload, filterObject } from "../../utils/multer.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: |
 *     ## 🔐 نظام التوثيق والأمان
 *     
 *     يوفر هذا القسم جميع العمليات المتعلقة بالتوثيق والأمان في منصة توبامين:
 *     
 *     ### 📋 العمليات المتاحة:
 *     - **تسجيل حساب جديد**: للطلاب والمعلمين
 *     - **تفعيل الحساب**: عبر البريد الإلكتروني
 *     - **تسجيل الدخول**: والحصول على الرمز المميز
 *     - **إعادة تعيين كلمة المرور**: عبر رمز التحقق
 *     
 *     ### 🎯 أنواع المستخدمين:
 *     - **`user`**: طلاب (يحتاجون تحديد المرحلة الدراسية)
 *     - **`instructor`**: معلمون (يحتاجون رفع وثائق التأهيل)
 *     - **`admin`**: مديرو النظام
 *     
 *     ### 🔄 سير العمل:
 *     1. **التسجيل** → 2. **تفعيل البريد** → 3. **تسجيل الدخول** → 4. **استخدام الرمز**
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       description: معلومات المستخدم الأساسية
 *       properties:
 *         firstName:
 *           type: string
 *           description: الاسم الأول
 *           example: "أحمد"
 *         lastName:
 *           type: string
 *           description: الاسم الأخير
 *           example: "محمد"
 *         email:
 *           type: string
 *           format: email
 *           description: البريد الإلكتروني
 *           example: "ahmed.mohamed@example.com"
 *         role:
 *           type: string
 *           enum: [user, instructor, admin]
 *           description: |
 *             دور المستخدم في النظام:
 *             - `user`: طالب
 *             - `instructor`: معلم
 *             - `admin`: مدير
 *           example: "user"
 *         governorate:
 *           type: string
 *           description: المحافظة
 *           example: "القاهرة"
 *         gradeLevel:
 *           type: string
 *           description: المرحلة الدراسية (للطلاب فقط)
 *           example: "المرحلة الثانوية"
 *         subject:
 *           type: string
 *           description: المادة التي يدرسها (للمعلمين فقط)
 *           example: "الرياضيات"
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: |
 *             حالة الحساب (للمعلمين):
 *             - `pending`: في انتظار الموافقة
 *             - `approved`: تم الموافقة
 *             - `rejected`: تم الرفض
 *           example: "approved"
 *         isConfirmed:
 *           type: boolean
 *           description: هل تم تفعيل البريد الإلكتروني
 *           example: true
 *     
 *     SignUpRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - confirmPassword
 *         - role
 *         - governorate
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 20
 *           description: الاسم الأول (2-20 حرف)
 *           example: "أحمد"
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 20
 *           description: الاسم الأخير (2-20 حرف)
 *           example: "محمد"
 *         email:
 *           type: string
 *           format: email
 *           description: البريد الإلكتروني (يجب أن يكون صحيحاً وغير مستخدم)
 *           example: "ahmed.mohamed@example.com"
 *         password:
 *           type: string
 *           description: كلمة المرور (يُنصح بأن تكون قوية)
 *           example: "SecurePassword123!"
 *         confirmPassword:
 *           type: string
 *           description: تأكيد كلمة المرور (يجب أن تطابق كلمة المرور)
 *           example: "SecurePassword123!"
 *         phone:
 *           type: string
 *           description: رقم الهاتف (اختياري)
 *           example: "01234567890"
 *         role:
 *           type: string
 *           enum: [user, instructor]
 *           description: |
 *             نوع الحساب:
 *             - `user`: طالب (يحتاج تحديد المرحلة الدراسية)
 *             - `instructor`: معلم (يحتاج رفع وثيقة + تحديد المادة)
 *           example: "user"
 *         governorate:
 *           type: string
 *           description: المحافظة (مطلوب للجميع)
 *           example: "القاهرة"
 *         gradeLevel:
 *           type: string
 *           description: |
 *             المرحلة الدراسية - **مطلوب للطلاب فقط**
 *             
 *             الخيارات المتاحة:
 *             - المرحلة الابتدائية
 *             - المرحلة الإعدادية  
 *             - المرحلة الثانوية
 *           example: "المرحلة الثانوية"
 *         subject:
 *           type: string
 *           description: |
 *             المادة التي يدرسها - **مطلوب للمعلمين فقط**
 *             
 *             أمثلة: الرياضيات، الفيزياء، الكيمياء، الأحياء، اللغة العربية، اللغة الإنجليزية
 *           example: "الرياضيات"
 *         document:
 *           type: string
 *           format: binary
 *           description: |
 *             وثيقة التأهيل - **مطلوب للمعلمين فقط**
 *             
 *             - الأنواع المقبولة: PDF, JPG, PNG, JPEG
 *             - الحد الأقصى للحجم: 5MB
 *             - يجب أن تكون وثيقة رسمية تثبت التأهيل التعليمي
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: البريد الإلكتروني المسجل
 *           example: "ahmed.mohamed@example.com"
 *         password:
 *           type: string
 *           description: كلمة المرور
 *           example: "SecurePassword123!"
 *     
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: البريد الإلكتروني المسجل لإرسال رمز إعادة التعيين
 *           example: "ahmed.mohamed@example.com"
 *     
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - forgetCode
 *         - password
 *         - confirmPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: البريد الإلكتروني
 *           example: "ahmed.mohamed@example.com"
 *         forgetCode:
 *           type: string
 *           minLength: 5
 *           maxLength: 5
 *           description: الرمز المكون من 5 أرقام المُرسل للبريد الإلكتروني
 *           example: "12345"
 *         password:
 *           type: string
 *           description: كلمة المرور الجديدة
 *           example: "NewSecurePassword123!"
 *         confirmPassword:
 *           type: string
 *           description: تأكيد كلمة المرور الجديدة
 *           example: "NewSecurePassword123!"
 *   
 *   responses:
 *     SignUpSuccess:
 *       description: تم التسجيل بنجاح
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "تم التسجيل بنجاح. يرجى فحص بريدك الإلكتروني لتفعيل الحساب"
 *           examples:
 *             student-signup:
 *               summary: تسجيل طالب بنجاح
 *               value:
 *                 success: true
 *                 message: "تم التسجيل بنجاح. يرجى فحص بريدك الإلكتروني لتفعيل الحساب"
 *             instructor-signup:
 *               summary: تسجيل معلم بنجاح
 *               value:
 *                 success: true
 *                 message: "تم التسجيل بنجاح. يرجى فحص بريدك الإلكتروني لتفعيل الحساب. سيتم مراجعة طلبك من قبل الإدارة"
 *     
 *     LoginSuccess:
 *       description: تم تسجيل الدخول بنجاح
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               token:
 *                 type: string
 *                 description: الرمز المميز JWT صالح لمدة 7 أيام
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           examples:
 *             successful-login:
 *               summary: تسجيل دخول ناجح
 *               value:
 *                 success: true
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjE2YjEyMzQ1Njc4OTBhYmNkZWYxMiIsImVtYWlsIjoiYWhtZWQubW9oYW1lZEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzEwMzQ1NjAwLCJleHAiOjE3MTA5NTA0MDB9.example_signature"
 *     
 *     PasswordResetSuccess:
 *       description: تم إرسال رمز إعادة تعيين كلمة المرور
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
 *     
 *     GenericSuccess:
 *       description: عملية ناجحة
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "تمت العملية بنجاح"
 *     
 *     ValidationError:
 *       description: خطأ في التحقق من صحة البيانات
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "خطأ في التحقق من صحة البيانات"
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: "email"
 *                     message:
 *                       type: string
 *                       example: "البريد الإلكتروني مطلوب"
 *           examples:
 *             email-validation:
 *               summary: خطأ في البريد الإلكتروني
 *               value:
 *                 success: false
 *                 message: "خطأ في التحقق من صحة البيانات"
 *                 errors:
 *                   - field: "email"
 *                     message: "يجب أن يكون البريد الإلكتروني صحيحاً"
 *             password-mismatch:
 *               summary: كلمات المرور غير متطابقة
 *               value:
 *                 success: false
 *                 message: "خطأ في التحقق من صحة البيانات"
 *                 errors:
 *                   - field: "confirmPassword"
 *                     message: "كلمة المرور وتأكيد كلمة المرور غير متطابقتان"
 *             missing-document:
 *               summary: وثيقة المعلم مفقودة
 *               value:
 *                 success: false
 *                 message: "وثيقة التأهيل مطلوبة للمعلمين"
 *     
 *     ConflictError:
 *       description: تضارب في البيانات (مثل البريد الإلكتروني مستخدم)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "البريد الإلكتروني مستخدم بالفعل"
 *     
 *     UnauthorizedError:
 *       description: بيانات الاعتماد غير صحيحة
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "بيانات الاعتماد غير صحيحة"
 *           examples:
 *             invalid-credentials:
 *               summary: بيانات اعتماد خاطئة
 *               value:
 *                 success: false
 *                 message: "بيانات الاعتماد غير صحيحة"
 *     
 *     ForbiddenError:
 *       description: الوصول مرفوض
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *           examples:
 *             email-not-confirmed:
 *               summary: البريد الإلكتروني غير مفعل
 *               value:
 *                 success: false
 *                 message: "يرجى تفعيل بريدك الإلكتروني أولاً"
 *             instructor-pending:
 *               summary: حساب المعلم في انتظار الموافقة
 *               value:
 *                 success: false
 *                 message: "حسابك في انتظار موافقة الإدارة"
 *             instructor-rejected:
 *               summary: حساب المعلم مرفوض
 *               value:
 *                 success: false
 *                 message: "تم رفض حسابك من قبل الإدارة"
 *     
 *     NotFoundError:
 *       description: المورد غير موجود
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *           examples:
 *             user-not-found:
 *               summary: المستخدم غير موجود
 *               value:
 *                 success: false
 *                 message: "المستخدم غير موجود"
 *             invalid-reset-code:
 *               summary: رمز إعادة التعيين غير صحيح
 *               value:
 *                 success: false
 *                 message: "رمز إعادة التعيين غير صحيح أو منتهي الصلاحية"
 *     
 *     ServerError:
 *       description: خطأ في الخادم
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً"
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: تسجيل حساب جديد
 *     description: |
 *       ## 📝 تسجيل حساب جديد في منصة توبامين
 *       
 *       ### 🎯 الغرض:
 *       يسمح للمستخدمين الجدد بإنشاء حساب في المنصة سواء كانوا طلاباً أو معلمين
 *       
 *       ### 📋 متطلبات التسجيل:
 *       
 *       #### للطلاب (`role: "user"`):
 *       - ✅ البيانات الأساسية (الاسم، البريد، كلمة المرور)
 *       - ✅ تحديد المحافظة
 *       - ✅ تحديد المرحلة الدراسية
 *       - ❌ لا يحتاجون رفع وثائق
 *       
 *       #### للمعلمين (`role: "instructor"`):
 *       - ✅ البيانات الأساسية (الاسم، البريد، كلمة المرور)
 *       - ✅ تحديد المحافظة
 *       - ✅ تحديد المادة التي يدرسونها
 *       - ✅ رفع وثيقة التأهيل (PDF أو صورة)
 *       - ⏳ يحتاجون موافقة الإدارة قبل تسجيل الدخول
 *       
 *       ### 🔄 سير العمل:
 *       1. **إرسال البيانات** → 2. **التحقق من صحة البيانات** → 3. **إنشاء الحساب** → 4. **إرسال بريد التفعيل**
 *       
 *       ### 💡 نصائح للتطوير:
 *       - استخدم `multipart/form-data` لرفع الملفات
 *       - تحقق من نوع المستخدم لإظهار الحقول المناسبة
 *       - أضف تحقق من قوة كلمة المرور في الواجهة
 *       - أظهر رسالة واضحة للمعلمين بأنهم يحتاجون موافقة الإدارة
 *     
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/SignUpRequest'
 *           examples:
 *             student-registration:
 *               summary: 👨‍🎓 تسجيل طالب جديد
 *               description: مثال على تسجيل طالب في المرحلة الثانوية
 *               value:
 *                 firstName: "أحمد"
 *                 lastName: "محمد"
 *                 email: "ahmed.mohamed@example.com"
 *                 password: "SecurePassword123!"
 *                 confirmPassword: "SecurePassword123!"
 *                 phone: "01234567890"
 *                 role: "user"
 *                 governorate: "القاهرة"
 *                 gradeLevel: "المرحلة الثانوية"
 *             instructor-registration:
 *               summary: 👨‍🏫 تسجيل معلم جديد
 *               description: مثال على تسجيل معلم رياضيات (يتطلب رفع وثيقة)
 *               value:
 *                 firstName: "فاطمة"
 *                 lastName: "زهراء"
 *                 email: "fatma.zahra@example.com"
 *                 password: "SecurePassword123!"
 *                 confirmPassword: "SecurePassword123!"
 *                 phone: "01234567891"
 *                 role: "instructor"
 *                 governorate: "الجيزة"
 *                 subject: "الرياضيات"
 *                 document: "(ملف PDF أو صورة)"
 *     responses:
 *       201:
 *         $ref: '#/components/responses/SignUpSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
    "/signup",
    fileUpload([...filterObject.image, ...filterObject.pdf]).single("document"),
    isValidation(Validators.signUpSchema),
    authController.signUp
);

/**
 * @swagger
 * /auth/confirm-email/{token}:
 *   get:
 *     summary: تفعيل البريد الإلكتروني
 *     description: |
 *       ## ✅ تفعيل البريد الإلكتروني
 *       
 *       ### 🎯 الغرض:
 *       تفعيل حساب المستخدم عبر الرابط المُرسل في البريد الإلكتروني
 *       
 *       ### 🔄 كيفية الاستخدام:
 *       1. المستخدم يسجل حساباً جديداً
 *       2. يتم إرسال بريد إلكتروني يحتوي على رابط التفعيل
 *       3. المستخدم يضغط على الرابط
 *       4. يتم تفعيل الحساب تلقائياً
 *       
 *       ### 💡 ملاحظات للتطوير:
 *       - الرابط صالح لمدة ساعة واحدة فقط
 *       - يمكن استخدام هذا الرابط مرة واحدة فقط
 *       - بعد التفعيل، يمكن للمستخدم تسجيل الدخول
 *       - للمعلمين: التفعيل لا يعني الموافقة على الحساب
 *       
 *       ### 🌐 استخدام في الواجهة:
 *       - يمكن عرض صفحة تأكيد بعد التفعيل
 *       - أضف رابط لتسجيل الدخول بعد التفعيل
 *       - أظهر رسالة خطأ واضحة إذا كان الرابط منتهي الصلاحية
 *     
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           رمز JWT للتفعيل المُرسل في البريد الإلكتروني
 *           
 *           **مثال على الرابط الكامل:**
 *           `https://topamun-backend.vercel.app/api/v1/auth/confirm-email/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjE2YjEyMzQ1Njc4OTBhYmNkZWYxMiIsImlhdCI6MTcxMDM0NTYwMCwiZXhwIjoxNzEwMzQ5MjAwfQ.example_signature"
 *     responses:
 *       200:
 *         description: تم تفعيل الحساب بنجاح
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
    "/confirm-email/:token",
    isValidation(Validators.confirmEmailSchema),
    authController.confirmEmail
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: تسجيل الدخول
 *     description: |
 *       ## 🔐 تسجيل الدخول إلى المنصة
 *       
 *       ### 🎯 الغرض:
 *       تسجيل دخول المستخدمين والحصول على الرمز المميز (JWT) للوصول للموارد المحمية
 *       
 *       ### 📋 متطلبات تسجيل الدخول:
 *       - ✅ البريد الإلكتروني وكلمة المرور صحيحان
 *       - ✅ تم تفعيل البريد الإلكتروني
 *       - ✅ للمعلمين: تم الموافقة على الحساب من قبل الإدارة
 *       
 *       ### 🔄 سير العمل:
 *       1. **إرسال البيانات** → 2. **التحقق من الصحة** → 3. **التحقق من التفعيل** → 4. **إنشاء الرمز المميز**
 *       
 *       ### 🎫 معلومات الرمز المميز:
 *       - **النوع**: JWT (JSON Web Token)
 *       - **المدة**: 7 أيام
 *       - **الاستخدام**: `Authorization: Bearer YOUR_TOKEN`
 *       - **المحتوى**: معرف المستخدم، البريد الإلكتروني، الدور
 *       
 *       ### 💡 نصائح للتطوير:
 *       - احفظ الرمز في localStorage أو secure cookie
 *       - أضف الرمز لجميع الطلبات المحمية
 *       - تحقق من انتهاء صلاحية الرمز
 *       - أظهر رسائل خطأ واضحة للمعلمين غير المعتمدين
 *       
 *       ### 🚨 حالات الخطأ الشائعة:
 *       - **401**: بيانات اعتماد خاطئة
 *       - **403**: البريد غير مفعل أو المعلم غير معتمد
 *     
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             student-login:
 *               summary: 👨‍🎓 تسجيل دخول طالب
 *               description: مثال على تسجيل دخول طالب
 *               value:
 *                 email: "ahmed.mohamed@example.com"
 *                 password: "SecurePassword123!"
 *             instructor-login:
 *               summary: 👨‍🏫 تسجيل دخول معلم
 *               description: مثال على تسجيل دخول معلم معتمد
 *               value:
 *                 email: "fatma.zahra@example.com"
 *                 password: "SecurePassword123!"
 *             admin-login:
 *               summary: 👨‍💼 تسجيل دخول مدير
 *               description: مثال على تسجيل دخول مدير النظام
 *               value:
 *                 email: "admin@topamun.com"
 *                 password: "AdminPassword123!"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/LoginSuccess'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/login", isValidation(Validators.loginSchema), authController.login);

/**
 * @swagger
 * /auth/forgot-password:
 *   patch:
 *     summary: طلب إعادة تعيين كلمة المرور
 *     description: |
 *       ## 🔄 طلب إعادة تعيين كلمة المرور
 *       
 *       ### 🎯 الغرض:
 *       إرسال رمز إعادة تعيين كلمة المرور إلى البريد الإلكتروني للمستخدم
 *       
 *       ### 🔄 سير العمل:
 *       1. **إدخال البريد الإلكتروني** → 2. **التحقق من وجود المستخدم** → 3. **إنشاء رمز عشوائي** → 4. **إرسال البريد الإلكتروني**
 *       
 *       ### 📧 معلومات الرمز:
 *       - **النوع**: رمز رقمي مكون من 5 أرقام
 *       - **المدة**: صالح حتى استخدامه أو تغيير كلمة المرور
 *       - **الاستخدام**: مرة واحدة فقط
 *       - **التوصيل**: عبر البريد الإلكتروني
 *       
 *       ### 💡 نصائح للتطوير:
 *       - أضف واجهة لإدخال البريد الإلكتروني
 *       - أظهر رسالة تأكيد بإرسال الرمز
 *       - وجه المستخدم لصفحة إدخال الرمز
 *       - أضف إمكانية إعادة الإرسال بعد فترة زمنية
 *       
 *       ### 🔒 الأمان:
 *       - لا يتم الكشف عن وجود البريد الإلكتروني من عدمه
 *       - الرمز عشوائي وغير قابل للتخمين
 *       - يتم إلغاء الرمز بعد الاستخدام
 *     
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *           examples:
 *             forgot-password-request:
 *               summary: 📧 طلب إعادة تعيين كلمة المرور
 *               description: إرسال رمز إعادة التعيين للبريد الإلكتروني
 *               value:
 *                 email: "ahmed.mohamed@example.com"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PasswordResetSuccess'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch(
    "/forgot-password",
    isValidation(Validators.forgetPasswordSchema),
    authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   patch:
 *     summary: إعادة تعيين كلمة المرور
 *     description: |
 *       ## 🔑 إعادة تعيين كلمة المرور
 *       
 *       ### 🎯 الغرض:
 *       تعيين كلمة مرور جديدة باستخدام الرمز المُرسل في البريد الإلكتروني
 *       
 *       ### 📋 متطلبات إعادة التعيين:
 *       - ✅ البريد الإلكتروني صحيح
 *       - ✅ رمز إعادة التعيين صحيح (5 أرقام)
 *       - ✅ كلمة المرور الجديدة وتأكيدها متطابقتان
 *       - ✅ الرمز لم يُستخدم من قبل
 *       
 *       ### 🔄 سير العمل:
 *       1. **إدخال البيانات** → 2. **التحقق من الرمز** → 3. **تشفير كلمة المرور** → 4. **إلغاء جميع الرموز المميزة**
 *       
 *       ### 🔒 الأمان:
 *       - يتم تشفير كلمة المرور الجديدة
 *       - يتم إلغاء جميع الرموز المميزة الموجودة
 *       - يتم حذف رمز إعادة التعيين
 *       - يحتاج المستخدم لتسجيل الدخول مرة أخرى
 *       
 *       ### 💡 نصائح للتطوير:
 *       - أضف تحقق من قوة كلمة المرور
 *       - أظهر رسالة تأكيد بنجاح العملية
 *       - وجه المستخدم لصفحة تسجيل الدخول
 *       - أضف إمكانية إخفاء/إظهار كلمة المرور
 *       
 *       ### ⚠️ تحذيرات:
 *       - بعد إعادة التعيين، جميع الأجهزة الأخرى ستحتاج لتسجيل الدخول مرة أخرى
 *       - الرمز يُستخدم مرة واحدة فقط
 *     
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *           examples:
 *             reset-password-request:
 *               summary: 🔑 إعادة تعيين كلمة المرور
 *               description: استخدام الرمز لتعيين كلمة مرور جديدة
 *               value:
 *                 email: "ahmed.mohamed@example.com"
 *                 forgetCode: "12345"
 *                 password: "NewSecurePassword123!"
 *                 confirmPassword: "NewSecurePassword123!"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/GenericSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch(
    "/reset-password",
    isValidation(Validators.resetPasswordSchema),
    authController.resetPassword
);

export default router;
