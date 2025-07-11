import { Router } from "express";
import * as Validators from "./auth.validation.js";
import { isValidation } from "../../middleware/validation.middleware.js";
import * as userController from "./controller/auth.js";
import { fileUpload, filterObject } from "../../utils/multer.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: The authentication managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StudentRegistration:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - confirmPassword
 *         - phone
 *         - province
 *         - role
 *         - academicStage
 *       properties:
 *         firstName:
 *           type: string
 *           description: The user's first name.
 *         lastName:
 *           type: string
 *           description: The user's last name.
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password.
 *         confirmPassword:
 *           type: string
 *           format: password
 *           description: Password confirmation.
 *         phone:
 *           type: string
 *           description: The user's phone number.
 *         province:
 *           type: string
 *           description: The user's province.
 *         role:
 *           type: string
 *           enum: [Student]
 *           description: The user's role.
 *         academicStage:
 *           type: string
 *           description: The student's academic stage.
 *
 *     TeacherRegistration:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - confirmPassword
 *         - phone
 *         - province
 *         - role
 *         - subject
 *         - profileImage
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         confirmPassword:
 *           type: string
 *           format: password
 *         phone:
 *           type: string
 *         province:
 *           type: string
 *         role:
 *           type: string
 *           enum: [Teacher]
 *         subject:
 *           type: string
 *           description: The teacher's subject.
 *         profileImage:
 *           type: string
 *           format: binary
 *           description: The teacher's profile image.
 *
 *     Login:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *
 *     ForgetCode:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *
 *     ResetPassword:
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
 *         forgetCode:
 *           type: string
 *           description: The 5-digit code sent to the user's email.
 *         password:
 *           type: string
 *           format: password
 *         confirmPassword:
 *           type: string
 *           format: password
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (Student or Teacher)
 *     tags: [Authentication]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/StudentRegistration'
 *               - $ref: '#/components/schemas/TeacherRegistration'
 *           examples:
 *             student:
 *               summary: Student Example
 *               value:
 *                 firstName: "Ahmed"
 *                 lastName: "Ali"
 *                 email: "student@example.com"
 *                 password: "password123"
 *                 confirmPassword: "password123"
 *                 phone: "1234567890"
 *                 province: "Cairo"
 *                 role: "Student"
 *                 academicStage: "High School"
 *             teacher:
 *               summary: Teacher Example
 *               value:
 *                 firstName: "Fatima"
 *                 lastName: "Zahra"
 *                 email: "teacher@example.com"
 *                 password: "password123"
 *                 confirmPassword: "password123"
 *                 phone: "0987654321"
 *                 province: "Alexandria"
 *                 role: "Teacher"
 *                 subject: "Physics"
 *                 profileImage: "(binary file)"
 *     responses:
 *       200:
 *         description: Registration successful. Student receives activation email. Teacher is pending approval.
 *       400:
 *         description: Bad request (e.g., validation error, certificate missing for teacher).
 *       409:
 *         description: Email already registered.
 */
router.post(
  "/register",
  fileUpload(filterObject.image).single("profileImage"),
  isValidation(Validators.registerSchema),
  userController.register
);

/**
 * @swagger
 * /auth/confirmEmail/{activationCode}:
 *   get:
 *     summary: Activate a student's account
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: activationCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The activation code sent to the student's email.
 *     responses:
 *       200:
 *         description: Account activated successfully.
 *       404:
 *         description: User not found or invalid activation code.
 */
router.get(
  "/confirmEmail/:activationCode",
  isValidation(Validators.activateSchema),
  userController.activationAccount
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       400:
 *         description: Invalid credentials or un-activated account.
 *       403:
 *         description: Teacher account is pending approval.
 */
router.post("/login", isValidation(Validators.login), userController.login);

/**
 * @swagger
 * /auth/forgetCode:
 *   patch:
 *     summary: Send a password reset code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgetCode'
 *     responses:
 *       200:
 *         description: Password reset code sent successfully.
 *       404:
 *         description: Invalid email.
 */
router.patch(
  "/forgetCode",
  isValidation(Validators.forgetCode),
  userController.sendForgetCode
);

/**
 * @swagger
 * /auth/resetPassword:
 *   patch:
 *     summary: Reset password using the code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Invalid email or code.
 */
router.patch(
  "/resetPassword",
  isValidation(Validators.resetPassword),
  userController.resetPasswordByCode
);

export default router;
