import { Router } from "express";
import { EqubController } from "../equb/equb.controller";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requireAdmin } from "../../middleware/authMiddleware";
import { EqubRegistrationController } from "./equb-registration.controller";

const router = Router();
const equbController = new EqubController();
const registrationController = new EqubRegistrationController();

router.post("/", authMiddleware, requireAdmin, equbController.createEqub);
router.put("/:id", authMiddleware, requireAdmin, equbController.updateEqub);
router.delete("/:id", authMiddleware, requireAdmin, equbController.deleteEqub);
router.delete("/", authMiddleware, requireAdmin, equbController.deleteAllEqubs);

router.get("/", authMiddleware, equbController.getEqubs);
router.get("/my", authMiddleware, equbController.getMyEqubs);
router.get("/history", authMiddleware, equbController.getHistoryStats);
router.get("/completed", authMiddleware, equbController.getCompletedEqubs);
router.get("/types", authMiddleware, equbController.getAvailableEqubTypes);
router.get("/lottery/status", authMiddleware, equbController.getLotteryStatus);
router.get("/:id/lottery", authMiddleware, equbController.getLotteryStatus);
router.get("/:id", authMiddleware, equbController.getEqubById);

router.post("/:id/join", authMiddleware, equbController.joinEqub);
router.post("/:id/leave", authMiddleware, equbController.leaveEqub);

router.post("/register", authMiddleware, registrationController.register);
router.get("/register/check", authMiddleware, registrationController.checkRegistration);

// ---- Equb Share Marketplace ----
router.get("/:id/listings", authMiddleware, equbController.getListings);
router.get("/listings/my", authMiddleware, equbController.getMyListings);
router.post("/:id/listings", authMiddleware, equbController.createListing);
router.post("/:id/listings/:listingId/buy", authMiddleware, equbController.buyListing);
router.delete("/:id/listings/:listingId", authMiddleware, equbController.cancelListing);

export default router;
