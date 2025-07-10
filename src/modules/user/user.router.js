import { Router } from "express";
import * as userController from "./controller/user.js";
import { 
  updateProfileSchema, 
  changePasswordSchema, 
  paginationSchema, 
  searchSchema 
} from "../auth/auth.validation.js";
import { 
  isAuthenticated, 
  requireConfirmedEmail,
  refreshTokenIfNeeded 
} from "../../middleware/authentication.middleware.js";
import { 
  requireAdmin,
  requireAdminOrOwner,
  canAccessProfile,
  canManageUsers,
  canApproveInstructors,
  canAccessSystemStats
} from "../../middleware/authorization.middleware.js";
import { validation, validateQuery } from "../../middleware/validation.middleware.js";
import { apiLimiter } from "../../middleware/rate-limiter.middleware.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: معرف المستخدم
 *         firstName:
 *           type: string
 *           description: الاسم الأول
 *         lastName:
 *           type: string
 *           description: الاسم الأخير
 *         email:
 *           type: string
 *           description: البريد الإلكتروني
 *         role:
 *           type: string
 *           enum: [user, instructor, admin]
 *           description: دور المستخدم
 *         governorate:
 *           type: string
 *           description: المحافظة
 *         gradeLevel:
 *           type: string
 *           description: المرحلة الدراسية (للطلاب)
 *         subject:
 *           type: string
 *           description: المادة الدراسية (للمعلمين)
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: حالة الحساب (للمعلمين)
 *         isConfirmed:
 *           type: boolean
 *           description: هل تم تفعيل البريد الإلكتروني
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: تاريخ إنشاء الحساب
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: تاريخ آخر تحديث
 */

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: الحصول على الملف الشخصي
 *     description: الحصول على بيانات الملف الشخصي للمستخدم الحالي
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم الحصول على الملف الشخصي بنجاح
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
 *                   example: تم الحصول على الملف الشخصي بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: غير مصرح لك بالوصول
 *       404:
 *         description: المستخدم غير موجود
 */
router.get(
  "/profile",
  isAuthenticated,
  requireConfirmedEmail,
  refreshTokenIfNeeded,
  userController.getProfile
);

/**
 * @swagger
 * /api/v1/users/profile:
 *   patch:
 *     summary: تحديث الملف الشخصي
 *     description: تحديث بيانات الملف الشخصي للمستخدم الحالي
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: الاسم الأول
 *                 example: أحمد
 *               lastName:
 *                 type: string
 *                 description: الاسم الأخير
 *                 example: محمد
 *               phone:
 *                 type: string
 *                 description: رقم الهاتف
 *                 example: "01234567890"
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
 *     responses:
 *       200:
 *         description: تم تحديث الملف الشخصي بنجاح
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
 *                   example: تم تحديث الملف الشخصي بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: خطأ في البيانات المدخلة
 *       401:
 *         description: غير مصرح لك بالوصول
 */
router.patch(
  "/profile",
  isAuthenticated,
  requireConfirmedEmail,
  apiLimiter.profileUpdate,
  validation(updateProfileSchema),
  userController.updateProfile
);

/**
 * @swagger
 * /api/v1/users/change-password:
 *   patch:
 *     summary: تغيير كلمة المرور
 *     description: تغيير كلمة المرور للمستخدم الحالي
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: كلمة المرور الحالية
 *                 example: CurrentPass123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: كلمة المرور الجديدة
 *                 example: NewPass123
 *               confirmNewPassword:
 *                 type: string
 *                 format: password
 *                 description: تأكيد كلمة المرور الجديدة
 *                 example: NewPass123
 *     responses:
 *       200:
 *         description: تم تغيير كلمة المرور بنجاح
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
 *                   example: تم تغيير كلمة المرور بنجاح
 *       400:
 *         description: خطأ في البيانات المدخلة
 *       401:
 *         description: غير مصرح لك بالوصول
 */
router.patch(
  "/change-password",
  isAuthenticated,
  requireConfirmedEmail,
  validation(changePasswordSchema),
  userController.changePassword
);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: الحصول على بيانات مستخدم محدد
 *     description: الحصول على بيانات مستخدم محدد (للمديرين فقط)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف المستخدم
 *     responses:
 *       200:
 *         description: تم الحصول على بيانات المستخدم بنجاح
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
 *                   example: تم الحصول على بيانات المستخدم بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: غير مصرح لك بالوصول
 *       403:
 *         description: ليس لديك صلاحية للوصول
 *       404:
 *         description: المستخدم غير موجود
 */
router.get(
  "/:userId",
  isAuthenticated,
  requireConfirmedEmail,
  canAccessProfile,
  userController.getUserById
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: الحصول على قائمة المستخدمين
 *     description: الحصول على قائمة جميع المستخدمين مع إمكانية التصفية والبحث (للمديرين فقط)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: رقم الصفحة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: عدد العناصر في الصفحة
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, firstName, -firstName, email, -email]
 *           default: -createdAt
 *         description: طريقة الترتيب
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, instructor, admin]
 *         description: تصفية حسب الدور
 *       - in: query
 *         name: governorate
 *         schema:
 *           type: string
 *         description: تصفية حسب المحافظة
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: تصفية حسب الحالة (للمعلمين)
 *       - in: query
 *         name: isConfirmed
 *         schema:
 *           type: boolean
 *         description: تصفية حسب تفعيل البريد الإلكتروني
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: البحث في الاسم والبريد الإلكتروني
 *     responses:
 *       200:
 *         description: تم الحصول على قائمة المستخدمين بنجاح
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
 *                   example: تم الحصول على قائمة المستخدمين بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalUsers:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: غير مصرح لك بالوصول
 *       403:
 *         description: ليس لديك صلاحية للوصول
 */
router.get(
  "/",
  isAuthenticated,
  requireConfirmedEmail,
  canManageUsers,
  validateQuery(paginationSchema),
  userController.getAllUsers
);

/**
 * @swagger
 * /api/v1/users/instructors/pending:
 *   get:
 *     summary: الحصول على المعلمين في انتظار الموافقة
 *     description: الحصول على قائمة المعلمين الذين في انتظار الموافقة (للمديرين فقط)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: رقم الصفحة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: عدد العناصر في الصفحة
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, firstName, -firstName]
 *           default: -createdAt
 *         description: طريقة الترتيب
 *     responses:
 *       200:
 *         description: تم الحصول على قائمة المعلمين المعلقين بنجاح
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
 *                   example: تم الحصول على قائمة المعلمين المعلقين بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     instructors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalInstructors:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: غير مصرح لك بالوصول
 *       403:
 *         description: ليس لديك صلاحية للوصول
 */
router.get(
  "/instructors/pending",
  isAuthenticated,
  requireConfirmedEmail,
  canApproveInstructors,
  validateQuery(paginationSchema),
  userController.getPendingInstructors
);

/**
 * @swagger
 * /api/v1/users/{userId}/status:
 *   patch:
 *     summary: تحديث حالة المعلم
 *     description: الموافقة على أو رفض حساب المعلم (للمديرين فقط)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف المعلم
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: الحالة الجديدة للمعلم
 *                 example: approved
 *               reason:
 *                 type: string
 *                 description: سبب الرفض (اختياري)
 *                 example: الوثائق غير واضحة
 *     responses:
 *       200:
 *         description: تم تحديث حالة المعلم بنجاح
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
 *                   example: تم قبول المعلم بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     instructor:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: خطأ في البيانات المدخلة
 *       401:
 *         description: غير مصرح لك بالوصول
 *       403:
 *         description: ليس لديك صلاحية للوصول
 *       404:
 *         description: المعلم غير موجود
 */
router.patch(
  "/:userId/status",
  isAuthenticated,
  requireConfirmedEmail,
  canApproveInstructors,
  apiLimiter.adminOperations,
  userController.updateInstructorStatus
);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   delete:
 *     summary: حذف مستخدم
 *     description: حذف حساب مستخدم (للمديرين فقط)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف المستخدم
 *     responses:
 *       200:
 *         description: تم حذف المستخدم بنجاح
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
 *                   example: تم حذف المستخدم بنجاح
 *       401:
 *         description: غير مصرح لك بالوصول
 *       403:
 *         description: ليس لديك صلاحية للوصول
 *       404:
 *         description: المستخدم غير موجود
 */
router.delete(
  "/:userId",
  isAuthenticated,
  requireConfirmedEmail,
  canManageUsers,
  apiLimiter.adminOperations,
  userController.deleteUser
);

/**
 * @swagger
 * /api/v1/users/stats:
 *   get:
 *     summary: الحصول على إحصائيات المستخدمين
 *     description: الحصول على إحصائيات شاملة للمستخدمين (للمديرين فقط)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم الحصول على إحصائيات المستخدمين بنجاح
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
 *                   example: تم الحصول على إحصائيات المستخدمين بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     userRoleStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           confirmed:
 *                             type: integer
 *                           active:
 *                             type: integer
 *                     instructorStatusStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     governorateDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         description: غير مصرح لك بالوصول
 *       403:
 *         description: ليس لديك صلاحية للوصول
 */
router.get(
  "/stats",
  isAuthenticated,
  requireConfirmedEmail,
  canAccessSystemStats,
  userController.getUserStats
);

/**
 * @swagger
 * /api/v1/users/search:
 *   get:
 *     summary: البحث في المستخدمين
 *     description: البحث في المستخدمين بالاسم أو البريد الإلكتروني (للمديرين فقط)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: كلمة البحث
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, instructor, admin]
 *         description: تصفية حسب الدور
 *       - in: query
 *         name: governorate
 *         schema:
 *           type: string
 *         description: تصفية حسب المحافظة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: عدد النتائج المطلوبة
 *     responses:
 *       200:
 *         description: تم البحث بنجاح
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
 *                   example: تم البحث بنجاح
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: خطأ في البيانات المدخلة
 *       401:
 *         description: غير مصرح لك بالوصول
 *       403:
 *         description: ليس لديك صلاحية للوصول
 */
router.get(
  "/search",
  isAuthenticated,
  requireConfirmedEmail,
  canManageUsers,
  apiLimiter.search,
  validateQuery(searchSchema),
  userController.searchUsers
);

export default router; 