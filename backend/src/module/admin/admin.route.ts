import { Router } from "express";
import * as adminController from "./admin.controller";
import { authMiddleware, requireAdmin, requireRole } from "../../middleware/authMiddleware";
import { upload } from "../../config/upload";

const router = Router();

router.get("/stats", authMiddleware, requireAdmin, adminController.getStats);
router.get("/sidebar-counts", authMiddleware, requireAdmin, adminController.getSidebarCounts);

router.get("/users", authMiddleware, requireAdmin, adminController.getAllUsers);
router.patch("/users/status", authMiddleware, requireAdmin, adminController.toggleUserStatus);

router.post("/kyc/verify", authMiddleware, requireRole(["SUPER_ADMIN", "CUSTOMER_SERVICE_ADMIN"]), adminController.verifyKyc);

router.get("/audit-logs", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.getAuditLogs);

router.post("/notifications/send", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.sendNotification);

router.get("/equbs", authMiddleware, requireAdmin, adminController.getAllEqubs);
router.get("/equbs/:id/members-detail", authMiddleware, requireAdmin, adminController.getEqubMembersDetail);
router.post("/equbs/create", authMiddleware, requireRole(["SUPER_ADMIN"]), upload.fields([{ name: "frontImage", maxCount: 1 }, { name: "backImage", maxCount: 1 }]), adminController.createEqub);
router.get("/payouts", authMiddleware, requireAdmin, adminController.getPayouts);
router.get("/registrations", authMiddleware, requireAdmin, adminController.getEqubRegistrations);
router.get("/attachments", authMiddleware, requireAdmin, adminController.getAttachments);
router.delete("/attachments/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.deleteAttachment);
router.get("/support-tickets", authMiddleware, requireAdmin, adminController.getSupportTickets);
router.patch("/support-tickets/:id", authMiddleware, requireRole(["SUPER_ADMIN", "CUSTOMER_SERVICE_ADMIN"]), adminController.updateSupportTicketStatus);
router.delete("/support-tickets/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.deleteSupportTicket);
router.delete("/registrations/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.deleteRegistration);
router.get("/monitoring", authMiddleware, requireAdmin, adminController.getPlatformMonitoring);
router.post("/force-add", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.forceAddMember);
router.post("/force-remove", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.forceRemoveMember);
router.post("/equbs/:id/draw", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.drawWinner);
router.patch("/equbs/:id/pause", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.pauseEqub);
router.patch("/equbs/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), upload.fields([{ name: "frontImage", maxCount: 1 }, { name: "backImage", maxCount: 1 }]), adminController.updateEqub);
router.delete("/equbs/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.deleteEqub);

// New Routes
router.get("/admins", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.getAdmins);
router.post("/admins", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.createAdmin);
router.patch("/admins/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.updateAdmin);
router.delete("/admins/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.deleteAdmin);

router.get("/payments", authMiddleware, requireRole(["SUPER_ADMIN", "FINANCE_ADMIN", "CUSTOMER_SERVICE_ADMIN"]), adminController.getPayments);
router.patch("/payments/:id/verify", authMiddleware, requireRole(["SUPER_ADMIN", "FINANCE_ADMIN"]), adminController.verifyPayment);
router.patch("/payouts/:id/verify", authMiddleware, requireRole(["SUPER_ADMIN", "FINANCE_ADMIN"]), adminController.verifyPayout);

router.patch("/attachments/:id/status", authMiddleware, requireRole(["SUPER_ADMIN", "CUSTOMER_SERVICE_ADMIN"]), adminController.setAttachmentStatus);

// Equb Share Marketplace Admin Routes
router.get("/listings", authMiddleware, requireRole(["SUPER_ADMIN", "FINANCE_ADMIN"]), adminController.getAllListings);
router.patch("/listings/:id/status", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.adminUpdateListingStatus);
router.delete("/listings/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.adminDeleteListing);

export default router;
