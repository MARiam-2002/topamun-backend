import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../utils/sendEmails.js";
import {
  activationEmail,
  passwordResetEmail,
  teacherPendingEmail,
} from "../../../utils/generateHtml.js";
import tokenModel from "../../../../DB/models/token.model.js";
import randomstring from "randomstring";
import cloudinary from "../../../utils/cloud.js";

export const register = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    province,
    role,
    academicStage,
    subject,
  } = req.body;

  const isUser = await userModel.findOne({ email });
  if (isUser) {
    return next(new Error("email already registered !", { cause: 409 }));
  }

  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );

  let user;
  if (role === "Teacher") {
    if (!req.file) {
      return next(new Error("Profile image is required.", { cause: 400 }));
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `topamun/users/teachers` }
    );
    user = await userModel.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      phone,
      province,
      role,
      subject,
      profileImage: { url: secure_url, id: public_id },
    });

    const isSent = await sendEmail({
      to: email,
      subject: "طلب التسجيل قيد المراجعة",
      html: teacherPendingEmail(firstName),
    });
    return isSent
      ? res.status(200).json({
          success: true,
          message: "Registration successful, please wait for admin approval.",
          data: null
        })
      : next(new Error("something went wrong!", { cause: 400 }));
  }

  // Student registration
  const activationCode = crypto.randomBytes(64).toString("hex");
  user = await userModel.create({
    firstName,
    lastName,
    email,
    password: hashPassword,
    phone,
    province,
    role,
    academicStage,
    activationCode,
  });

  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${activationCode}`;

  const isSent = await sendEmail({
    to: email,
    subject: "Activate Account",
    html: activationEmail(firstName, link),
  });

  return isSent
    ? res.status(200).json({ 
        success: true, 
        message: "Please review Your email!",
        data: null
      })
    : next(new Error("something went wrong!", { cause: 400 }));
});

export const activationAccount = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOneAndUpdate(
    { activationCode: req.params.activationCode },
    { isConfirmed: true, $unset: { activationCode: 1 } }
  );

  if (!user) {
    return next(new Error("User Not Found!", { cause: 404 }));
  }
  return res.status(200).json({
    success: true,
    message: "Account activated successfully, try to login",
    data: null
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new Error("Invalid Credentials", { cause: 400 }));
  }

  const match = bcryptjs.compareSync(password, user.password);

  if (!match) {
    return next(new Error("Invalid Credentials", { cause: 400 }));
  }

  if (!user.isConfirmed) {
    return next(new Error("Un-activated Account, please confirm your email", { cause: 400 }));
  }

  if (user.role === "Teacher" && !user.isApproved) {
    return next(
      new Error("Your account is pending approval from the admin.", {
        cause: 403,
      })
    );
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.TOKEN_KEY,
    { expiresIn: "7d" }
  );

  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });

  user.status = "online";
  await user.save();

  return res.status(200).json({ 
    success: true, 
    message: "Logged in successfully",
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage?.url
      }
    }
  });
});

export const sendForgetCode = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new Error("Invalid email!", { cause: 404 }));
  }

  const code = randomstring.generate({
    length: 5,
    charset: "numeric",
  });

  user.forgetCode = code;
  await user.save();

  return (await sendEmail({
    to: user.email,
    subject: "إعادة تعيين كلمة المرور",
    html: passwordResetEmail(user.firstName, code),
  }))
    ? res.status(200).json({ 
        success: true, 
        message: "Reset code sent to your email",
        data: null
      })
    : next(new Error("Something went wrong!", { cause: 400 }));
});

export const resetPasswordByCode = asyncHandler(async (req, res, next) => {
  const { email, password, forgetCode } = req.body;
  
  const user = await userModel.findOne({ email, forgetCode });
  if(!user){
      return next(new Error("Invalid email or code!", { cause: 400 }));
  }

  const newPassword = bcryptjs.hashSync(password, +process.env.SALT_ROUND);
  
  user.password = newPassword;
  user.forgetCode = undefined; //Remove the forget code
  await user.save();

  //invalidate tokens
  const tokens = await tokenModel.updateMany({ user: user._id }, {isValid: false});

  return res.status(200).json({ 
    success: true, 
    message: "Password updated successfully, Please try to login!",
    data: null
  });
});
