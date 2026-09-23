import { Router } from "express";
import * as authController from "./auth.controller";
import { authMiddleware } from "../../middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const router = Router();

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per window
  message: "Too many login attempts from this IP, please try again after 15 minutes."
});

router.post("/request-otp", strictAuthLimiter, authController.requestOtp);
router.post("/resend-otp", strictAuthLimiter, authController.resendOtp);
router.post("/verify-otp", strictAuthLimiter, authController.verifyOtp);
router.post("/logout", authMiddleware, authController.logout);

router.post("/login-admin", strictAuthLimiter, authController.loginAdmin);
router.post("/update-profile", authMiddleware, authController.updateAdminProfile);

export default router;
