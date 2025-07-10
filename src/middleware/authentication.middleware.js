import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import tokenModel from "../../DB/models/token.model.js";
import userModel from "../../DB/models/user.model.js";
import { AppError } from "../utils/error.class.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
    let token = req.headers["authorization"]; // Use "authorization" header

    if (!token || !token.startsWith(process.env.BEARER_KEY)) {
        return next(new AppError("Valid token is required", 401));
    }

    token = token.split(process.env.BEARER_KEY)[1];

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    if (!decoded) {
        return next(new AppError("Invalid token", 401));
    }

    const tokenDB = await tokenModel.findOne({ token, isValid: true });
    if (!tokenDB) {
        return next(new AppError("Token expired or invalid", 401));
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    req.user = user;
    return next();
});
