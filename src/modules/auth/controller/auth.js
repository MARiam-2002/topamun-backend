import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../utils/sendEmails.js";
import { resetPassword as resetPasswordTemplate, signupTemp } from "../../../utils/generateHtml.js";
import tokenModel from "../../../../DB/models/token.model.js";
import randomstring from "randomstring";
import { systemRoles } from "../../../utils/system-roles.js";
import cloudinary from "../../../utils/cloud.js";
import { AppError } from "../../../utils/error.class.js";

// Helper function for token generation and saving
const generateAndSaveToken = async (res, user, agent) => {
    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.TOKEN_KEY,
        { expiresIn: "7d" }
    );

    await tokenModel.create({
        token,
        user: user._id,
        agent,
    });

    user.isLoggedIn = true;
    await user.save();

    return res.status(200).json({ success: true, token });
};

export const signUp = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, role, phone, governorate, gradeLevel, subject } = req.body;

    const isUser = await userModel.findOne({ email });
    if (isUser) {
        return next(new AppError("Email already registered!", 409));
    }

    if (role === systemRoles.INSTRUCTOR && !req.file) {
        return next(new AppError("Instructor document is required.", 400));
    }

    const userObject = {
        firstName,
        lastName,
        email,
        password,
        role,
        phone,
        governorate,
    };

    if (role === systemRoles.USER) {
        userObject.gradeLevel = gradeLevel;
    }

    if (role === systemRoles.INSTRUCTOR) {
        userObject.subject = subject;
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `topamun/documents/${userObject.firstName}_${userObject.lastName}`
        });
        userObject.document = { secure_url, public_id };
        userObject.status = 'pending';
    }

    const user = await userModel.create(userObject);

    const confirmationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_CONFIRMATION, { expiresIn: '1h' });
    const confirmationLink = `${req.protocol}://${req.headers.host}/api/v1/auth/confirm-email/${confirmationToken}`;

    const isSent = await sendEmail({
        to: email,
        subject: "Activate Account",
        html: signupTemp(confirmationLink),
    });

    if (!isSent) {
        return next(new AppError("Something went wrong with sending email!", 500));
    }

    return res.status(201).json({ success: true, message: "Registration successful. Please check your email to activate your account." });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_CONFIRMATION);

    if (!decoded?.id) {
        return next(new AppError("Invalid token", 400));
    }

    const user = await userModel.findByIdAndUpdate(
        decoded.id,
        { isConfirmed: true },
        { new: true }
    );

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    return res.status(200).send("Account activated successfully. You can now log in.");
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        return next(new AppError("Invalid credentials", 401));
    }

    if (!user.isConfirmed) {
        return next(new AppError("Please confirm your email first.", 403));
    }

    if (user.role === systemRoles.INSTRUCTOR && user.status !== 'approved') {
        const statusMessage = user.status === 'pending' ? 'Your account is pending approval.' : 'Your account was rejected.';
        return next(new AppError(statusMessage, 403));
    }

    const match = bcryptjs.compareSync(password, user.password);
    if (!match) {
        return next(new AppError("Invalid credentials", 401));
    }

    return generateAndSaveToken(res, user, req.headers["user-agent"]);
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        return next(new AppError("User not found.", 404));
    }

    const code = randomstring.generate({
        length: 5,
        charset: "numeric",
    });

    user.forgetCode = code;
    await user.save();

    const isSent = await sendEmail({
        to: user.email,
        subject: "Password Reset Code",
        html: resetPasswordTemplate(code),
    });

    if (!isSent) {
        return next(new AppError("Failed to send email.", 500));
    }

    return res.status(200).json({ success: true, message: "Password reset code sent to your email." });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, forgetCode, password } = req.body;

    const user = await userModel.findOne({ email, forgetCode });
    if (!user) {
        return next(new AppError("Invalid code or email.", 400));
    }

    user.password = password;
    user.forgetCode = undefined;
    await user.save();

    await tokenModel.updateMany({ user: user._id }, { isValid: false });

    return res.status(200).json({ success: true, message: "Password reset successfully. Please log in." });
});
