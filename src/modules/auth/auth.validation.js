import joi from "joi";

export const registerSchema = joi.object({
  firstName: joi.string().min(2).max(20).required(),
  lastName: joi.string().min(2).max(20).required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  confirmPassword: joi.string().valid(joi.ref("password")).required(),
  phone: joi.string().required(),
  province: joi.string().required(),
  role: joi.string().valid("Student", "Teacher").required(),
  academicStage: joi.when("role", {
    is: "Student",
    then: joi.string().required(),
    otherwise: joi.optional(),
  }),
  subject: joi.when("role", {
    is: "Teacher",
    then: joi.string().required(),
    otherwise: joi.optional(),
  }),
});

export const activateSchema = joi
  .object({
    activationCode: joi.string().required(),
  })
  .required();

export const login = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

export const forgetCode = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

export const resetPassword = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    forgetCode: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();
