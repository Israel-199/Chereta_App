import { Router } from "express";
import * as userController from "./user.controller";
import { authMiddleware } from "../../middleware/authMiddleware";
import { upload } from "../../config/upload";

const router = Router();

router.post(
  "/complete-profile",
  authMiddleware,
  upload.single("photo"),
  userController.completeProfile,
);

router.get("/me", authMiddleware, userController.getMe);
router.get("/notifications", authMiddleware, userController.getNotifications);

router.get("/attachments", authMiddleware, userController.getAttachments);
router.post(
  "/attachments",
  authMiddleware,
  upload.single("file"),
  userController.uploadAttachment,
);
router.patch(
  "/attachments/:id",
  authMiddleware,
  upload.single("file"),
  userController.updateAttachment,
);
router.delete("/attachments/:id", authMiddleware, userController.deleteAttachment);
router.post("/kyc", authMiddleware, userController.submitKyc);
router.post(
  "/kyc-submit",
  authMiddleware,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  userController.submitKycWithFiles
);

export default router;

