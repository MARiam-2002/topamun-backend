import { asyncHandler } from "../../../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res, next) => {
    // The user object is attached to the request by the isAuthenticated middleware
    const user = req.user;

    // We don't want to send the password back
    user.password = undefined;
    user.forgetCode = undefined;

    return res.status(200).json({ success: true, user });
}); 