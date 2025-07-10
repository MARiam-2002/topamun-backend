import { Router } from "express";
import * as userController from "./controller/user.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";

const router = Router();

router.get("/profile", isAuthenticated, userController.getProfile);

export default router; 