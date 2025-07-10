import joi from "joi";
import { systemRoles } from "../../utils/system-roles.js";

// No longer needed as it's not a rule
// const objectIdRule = joi.string().hex().length(24);

export const signUpSchema = joi.object({
    firstName: joi.string().min(2).max(20).required(),
    lastName: joi.string().min(2).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    phone: joi.string().optional(),
    governorate: joi.string().required(),
    role: joi.string().valid(systemRoles.USER, systemRoles.INSTRUCTOR).required(),
    // Conditional validation based on role
    gradeLevel: joi.when('role', {
        is: systemRoles.USER,
        then: joi.string().required(),
        otherwise: joi.forbidden()
    }),
    subject: joi.when('role', {
        is: systemRoles.INSTRUCTOR,
        then: joi.string().required(),
        otherwise: joi.forbidden()
    })
}).required();


export const confirmEmailSchema = joi.object({
    token: joi.string().required(),
}).required();

export const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
}).required();

export const forgetPasswordSchema = joi.object({
    email: joi.string().email().required(),
}).required();

export const resetPasswordSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    forgetCode: joi.string().length(5).required(),
}).required();
