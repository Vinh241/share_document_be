import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authenticate, checkUserExists } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/me", authenticate, checkUserExists, authController.getMe);

export default router;
