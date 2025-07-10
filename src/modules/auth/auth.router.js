import { Router } from "express";
import multer from "multer";
import * as authController from "./controller/auth.js";
import { 
  signUpSchema, 
  confirmEmailSchema, 
  loginSchema, 
  forgetPasswordSchema, 
  resetPasswordSchema 
} from "./auth.validation.js";
import { 
  isAuthenticated, 
  requireConfirmedEmail,
  refreshTokenIfNeeded 
} from "../../middleware/authentication.middleware.js";
import { 
  requireRole, 
  requireAdmin 
} from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { rateLimiter } from "../../middleware/rate-limiter.middleware.js";
import { APP_CONFIG, SYSTEM_ROLES } from "../../config/constants.js";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, APP_CONFIG.UPLOAD.TEMP_FOLDER);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = APP_CONFIG.UPLOAD.ALLOWED_TYPES;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يُسمح فقط بملفات PDF, DOC, DOCX'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: APP_CONFIG.UPLOAD.MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: تسجيل مستخدم جديد
 *     description: تسجيل مستخدم جديد في النظام (طالب أو معلم)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - confirmPassword
 *               - role
 *               - governorate
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: الاسم الأول
 *                 example: أحمد
 *               lastName:
 *                 type: string
 *                 description: الاسم الأخير
 *                 example: محمد
 *               email:
 *                 type: string
 *                 format: email
 *                 description: البريد الإلكتروني
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: كلمة المرور
 *                 example: SecurePass123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: تأكيد كلمة المرور
 *                 example: SecurePass123
 *               phone:
 *                 type: string
 *                 description: رقم الهاتف (اختياري)
 *                 example: "01234567890"
 *               role:
 *                 type: string
 *                 enum: [user, instructor]
 *                 description: نوع المستخدم
 *                 example: user
 *               governorate:
 *                 type: string
 *                 description: المحافظة
 *                 example: القاهرة
 *               gradeLevel:
 *                 type: string
 *                 description: المرحلة الدراسية (للطلاب فقط)
 *                 example: المرحلة الثانوية
 *               subject:
 *                 type: string
 *                 description: المادة الدراسية (للمعلمين فقط)
 *                 example: الرياضيات
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: وثيقة التأهيل (للمعلمين فقط)
 *     responses:
 *       201:
 *         description: تم التسجيل بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم التسجيل بنجاح. يرجى تفعيل حسابك من البريد الإلكتروني
 *       400:
 *         description: خطأ في البيانات المدخلة
 *       409:
 *         description: البريد الإلكتروني مستخدم بالفعل
 *       500:
 *         description: خطأ في الخادم
 */
router.post(
  "/register",
  rateLimiter.registration,
  upload.single("document"),
  validation(signUpSchema),
  authController.signUp
);

/**
 * @swagger
 * /api/v1/auth/confirm-email/{token}:
 *   get:
 *     summary: تفعيل الحساب
 *     description: تفعيل حساب المستخدم عبر الرابط المرسل للبريد الإلكتروني
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: رمز التفعيل
 *     responses:
 *       200:
 *         description: تم تفعيل الحساب بنجاح
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>تم تفعيل حسابك بنجاح</html>"
 *       400:
 *         description: رمز التفعيل غير صحيح أو منتهي الصلاحية
 *       404:
 *         description: المستخدم غير موجود
 */
router.get(
  "/confirm-email/:token",
  validation(confirmEmailSchema, ['params']),
  authController.confirmEmail
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: تسجيل الدخول
 *     description: تسجيل دخول المستخدم للنظام
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: البريد الإلكتروني
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: كلمة المرور
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: تم تسجيل الدخول بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم تسجيل الدخول بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: خطأ في البيانات المدخلة
 *       401:
 *         description: بيانات الدخول غير صحيحة
 *       403:
 *         description: الحساب معلق أو غير مفعل
 */
router.post(
  "/login",
  rateLimiter.login,
  validation(loginSchema),
  authController.login
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: نسيان كلمة المرور
 *     description: إرسال رمز إعادة تعيين كلمة المرور للبريد الإلكتروني
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: البريد الإلكتروني
 *                 example: ahmed@example.com
 *     responses:
 *       200:
 *         description: تم إرسال رمز إعادة التعيين بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم إرسال رمز إعادة تعيين كلمة المرور لبريدك الإلكتروني
 *       404:
 *         description: البريد الإلكتروني غير موجود
 *       500:
 *         description: خطأ في إرسال البريد الإلكتروني
 */
router.post(
  "/forgot-password",
  rateLimiter.forgotPassword,
  validation(forgetPasswordSchema),
  authController.forgotPassword
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: إعادة تعيين كلمة المرور
 *     description: إعادة تعيين كلمة المرور باستخدام الرمز المرسل
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - forgetCode
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: البريد الإلكتروني
 *                 example: ahmed@example.com
 *               forgetCode:
 *                 type: string
 *                 description: رمز إعادة التعيين (5 أرقام)
 *                 example: "12345"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: كلمة المرور الجديدة
 *                 example: NewSecurePass123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: تأكيد كلمة المرور الجديدة
 *                 example: NewSecurePass123
 *     responses:
 *       200:
 *         description: تم إعادة تعيين كلمة المرور بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم إعادة تعيين كلمة المرور بنجاح
 *       400:
 *         description: رمز إعادة التعيين غير صحيح أو منتهي الصلاحية
 */
router.post(
  "/reset-password",
  rateLimiter.resetPassword,
  validation(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: تسجيل الخروج
 *     description: تسجيل خروج المستخدم من الجهاز الحالي
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم تسجيل الخروج بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم تسجيل الخروج بنجاح
 *       401:
 *         description: غير مصرح لك بالوصول
 */
router.post(
  "/logout",
  isAuthenticated,
  authController.logout
);

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     summary: تسجيل الخروج من جميع الأجهزة
 *     description: تسجيل خروج المستخدم من جميع الأجهزة
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم تسجيل الخروج من جميع الأجهزة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم تسجيل الخروج من جميع الأجهزة بنجاح
 *       401:
 *         description: غير مصرح لك بالوصول
 */
router.post(
  "/logout-all",
  isAuthenticated,
  authController.logoutAll
);

/**
 * @swagger
 * /api/v1/auth/sessions:
 *   get:
 *     summary: الحصول على الجلسات النشطة
 *     description: الحصول على قائمة بجميع الجلسات النشطة للمستخدم
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم الحصول على الجلسات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: تم الحصول على الجلسات بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           device:
 *                             type: string
 *                           location:
 *                             type: object
 *                           ipAddress:
 *                             type: string
 *                           lastUsed:
 *                             type: string
 *                             format: date-time
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: غير مصرح لك بالوصول
 */
router.get(
  "/sessions",
  isAuthenticated,
  refreshTokenIfNeeded,
  authController.getUserSessions
);

export default router;
