import { Router } from "express";
import * as userController from "./controller/user.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: |
 *     ## 👤 إدارة المستخدمين
 *     
 *     يوفر هذا القسم العمليات المتعلقة بإدارة ملفات المستخدمين الشخصية:
 *     
 *     ### 📋 العمليات المتاحة:
 *     - **عرض الملف الشخصي**: الحصول على معلومات المستخدم الحالي
 *     - **تحديث الملف الشخصي**: تعديل البيانات الشخصية (قريباً)
 *     - **حذف الحساب**: إلغاء الحساب نهائياً (قريباً)
 *     
 *     ### 🔐 التوثيق المطلوب:
 *     جميع endpoints في هذا القسم تتطلب رمز التوثيق (JWT Token)
 *     
 *     ### 💡 ملاحظة:
 *     يجب تسجيل الدخول أولاً للوصول لهذه العمليات
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       description: معلومات الملف الشخصي للمستخدم
 *       properties:
 *         _id:
 *           type: string
 *           description: معرف المستخدم الفريد
 *           example: "65f16b12345678901234567890abcdef"
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
 *         phone:
 *           type: string
 *           description: رقم الهاتف
 *           example: "01234567890"
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
 *             حالة الحساب (للمعلمين فقط):
 *             - `pending`: في انتظار الموافقة
 *             - `approved`: تم الموافقة
 *             - `rejected`: تم الرفض
 *           example: "approved"
 *         isConfirmed:
 *           type: boolean
 *           description: هل تم تفعيل البريد الإلكتروني
 *           example: true
 *         isLoggedIn:
 *           type: boolean
 *           description: هل المستخدم مسجل دخول حالياً
 *           example: true
 *         provider:
 *           type: string
 *           description: طريقة إنشاء الحساب
 *           example: "system"
 *         document:
 *           type: object
 *           description: وثيقة التأهيل (للمعلمين فقط)
 *           properties:
 *             secure_url:
 *               type: string
 *               description: رابط الوثيقة المحمي
 *               example: "https://res.cloudinary.com/topamun/image/upload/v1234567890/topamun/documents/fatma_zahra/document.pdf"
 *             public_id:
 *               type: string
 *               description: معرف الوثيقة في Cloudinary
 *               example: "topamun/documents/fatma_zahra/document"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: تاريخ إنشاء الحساب
 *           example: "2024-03-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: تاريخ آخر تحديث
 *           example: "2024-03-15T10:30:00.000Z"
 *   
 *   responses:
 *     UserProfileSuccess:
 *       description: تم الحصول على الملف الشخصي بنجاح
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               user:
 *                 $ref: '#/components/schemas/UserProfile'
 *           examples:
 *             student-profile:
 *               summary: ملف شخصي لطالب
 *               description: مثال على ملف شخصي لطالب في المرحلة الثانوية
 *               value:
 *                 success: true
 *                 user:
 *                   _id: "65f16b12345678901234567890abcdef"
 *                   firstName: "أحمد"
 *                   lastName: "محمد"
 *                   email: "ahmed.mohamed@example.com"
 *                   phone: "01234567890"
 *                   role: "user"
 *                   governorate: "القاهرة"
 *                   gradeLevel: "المرحلة الثانوية"
 *                   status: "approved"
 *                   isConfirmed: true
 *                   isLoggedIn: true
 *                   provider: "system"
 *                   createdAt: "2024-03-15T10:30:00.000Z"
 *                   updatedAt: "2024-03-15T10:30:00.000Z"
 *             instructor-profile:
 *               summary: ملف شخصي لمعلم
 *               description: مثال على ملف شخصي لمعلم معتمد
 *               value:
 *                 success: true
 *                 user:
 *                   _id: "65f16b12345678901234567890abcdef"
 *                   firstName: "فاطمة"
 *                   lastName: "زهراء"
 *                   email: "fatma.zahra@example.com"
 *                   phone: "01234567891"
 *                   role: "instructor"
 *                   governorate: "الجيزة"
 *                   subject: "الرياضيات"
 *                   status: "approved"
 *                   isConfirmed: true
 *                   isLoggedIn: true
 *                   provider: "system"
 *                   document:
 *                     secure_url: "https://res.cloudinary.com/topamun/image/upload/v1234567890/topamun/documents/fatma_zahra/document.pdf"
 *                     public_id: "topamun/documents/fatma_zahra/document"
 *                   createdAt: "2024-03-15T10:30:00.000Z"
 *                   updatedAt: "2024-03-15T10:30:00.000Z"
 *             admin-profile:
 *               summary: ملف شخصي لمدير
 *               description: مثال على ملف شخصي لمدير النظام
 *               value:
 *                 success: true
 *                 user:
 *                   _id: "65f16b12345678901234567890abcdef"
 *                   firstName: "محمد"
 *                   lastName: "أحمد"
 *                   email: "admin@topamun.com"
 *                   phone: "01234567892"
 *                   role: "admin"
 *                   governorate: "القاهرة"
 *                   status: "approved"
 *                   isConfirmed: true
 *                   isLoggedIn: true
 *                   provider: "system"
 *                   createdAt: "2024-03-15T10:30:00.000Z"
 *                   updatedAt: "2024-03-15T10:30:00.000Z"
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: الحصول على الملف الشخصي
 *     description: |
 *       ## 👤 عرض الملف الشخصي للمستخدم الحالي
 *       
 *       ### 🎯 الغرض:
 *       الحصول على جميع معلومات المستخدم الشخصية بناءً على الرمز المميز المُرسل
 *       
 *       ### 🔐 التوثيق المطلوب:
 *       - يجب إرسال رمز التوثيق في header: `Authorization: Bearer YOUR_TOKEN`
 *       - الرمز يجب أن يكون صالحاً وغير منتهي الصلاحية
 *       - يجب أن يكون المستخدم مسجل دخول
 *       
 *       ### 📋 البيانات المُرجعة:
 *       يتم إرجاع جميع معلومات المستخدم باستثناء:
 *       - كلمة المرور (مشفرة ومخفية)
 *       - رمز إعادة تعيين كلمة المرور
 *       - البيانات الحساسة الأخرى
 *       
 *       ### 🎭 البيانات حسب نوع المستخدم:
 *       
 *       #### للطلاب (`role: "user"`):
 *       - البيانات الأساسية + المحافظة + المرحلة الدراسية
 *       - لا يوجد وثائق أو مواد تدريسية
 *       
 *       #### للمعلمين (`role: "instructor"`):
 *       - البيانات الأساسية + المحافظة + المادة التدريسية
 *       - وثيقة التأهيل (إذا كانت موجودة)
 *       - حالة الموافقة من الإدارة
 *       
 *       #### للمديرين (`role: "admin"`):
 *       - البيانات الأساسية + المحافظة
 *       - صلاحيات إدارية (في endpoints أخرى)
 *       
 *       ### 💡 نصائح للتطوير:
 *       - استخدم هذا endpoint لعرض معلومات المستخدم في الواجهة
 *       - احفظ البيانات محلياً لتجنب الطلبات المتكررة
 *       - تحقق من `isLoggedIn` للتأكد من حالة تسجيل الدخول
 *       - للمعلمين: تحقق من `status` لمعرفة حالة الموافقة
 *       
 *       ### 🔄 حالات الاستخدام:
 *       - عرض الملف الشخصي في لوحة التحكم
 *       - ملء النماذج مسبقاً ببيانات المستخدم
 *       - التحقق من صلاحيات المستخدم
 *       - عرض معلومات المستخدم في التطبيق
 *     
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserProfileSuccess'
 *       401:
 *         description: غير مصرح - الرمز المميز مطلوب أو غير صحيح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *             examples:
 *               missing-token:
 *                 summary: الرمز المميز مفقود
 *                 value:
 *                   success: false
 *                   message: "الرمز المميز مطلوب"
 *               invalid-token:
 *                 summary: الرمز المميز غير صحيح
 *                 value:
 *                   success: false
 *                   message: "الرمز المميز غير صحيح"
 *               expired-token:
 *                 summary: الرمز المميز منتهي الصلاحية
 *                 value:
 *                   success: false
 *                   message: "الرمز المميز منتهي الصلاحية أو غير صالح"
 *       404:
 *         description: المستخدم غير موجود
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "المستخدم غير موجود"
 *       500:
 *         description: خطأ في الخادم
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً"
 */
router.get("/profile", isAuthenticated, userController.getProfile);

export default router; 