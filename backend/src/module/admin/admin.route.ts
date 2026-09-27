import { Router } from "express";
import * as adminController from "./admin.controller";
import { authMiddleware, requireAdmin, requireRole } from "../../middleware/authMiddleware";
import { upload } from "../../config/upload";

const router = Router();

router.get("/stats", authMiddleware, requireAdmin, adminController.getStats);
router.get("/sidebar-counts", authMiddleware, requireAdmin, adminController.getSidebarCounts); // Note: still valid for attachments/tickets/kyc

router.get("/users", authMiddleware, requireAdmin, adminController.getAllUsers);
router.patch("/users/status", authMiddleware, requireAdmin, adminController.toggleUserStatus);

router.post("/kyc/verify", authMiddleware, requireRole(["SUPER_ADMIN", "CUSTOMER_SERVICE_ADMIN"]), adminController.verifyKyc);

router.get("/audit-logs", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.getAuditLogs);

router.post("/notifications/send", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.sendNotification);

// AUCTIONS API (CHERETA)
router.get("/auctions", authMiddleware, requireRole(["SUPER_ADMIN", "FINANCE_ADMIN", "CUSTOMER_SERVICE_ADMIN"]), adminController.getAllAuctions);
router.get("/auctions/:id", authMiddleware, adminController.getAuctionDetails);
router.get("/auctions/:id/bids", authMiddleware, adminController.getAuctionBids);
router.post("/auctions", authMiddleware, requireRole(["SUPER_ADMIN"]), upload.fields([{ name: "images", maxCount: 8 }]), adminController.createAuction);
router.patch("/auctions/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), upload.fields([{ name: "images", maxCount: 8 }]), adminController.updateAuction);
router.patch("/auctions/:id/status", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.updateAuctionStatus);
router.post("/auctions/:id/resolve", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.resolveAuction);
router.delete("/auctions/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.deleteAuction);
router.get("/chereta-payments", authMiddleware, requireRole(["SUPER_ADMIN", "FINANCE_ADMIN"]), adminController.getCheretaPayments);
router.get("/chereta-payments", authMiddleware, requireRole(["SUPER_ADMIN", "FINANCE_ADMIN"]), adminController.getCheretaPayments);

// Attachments & Support Tickets
router.get("/attachments", authMiddleware, requireAdmin, adminController.getAttachments);
router.delete("/attachments/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.deleteAttachment);
router.patch("/attachments/:id/status", authMiddleware, requireRole(["SUPER_ADMIN", "CUSTOMER_SERVICE_ADMIN"]), adminController.setAttachmentStatus);

router.get("/support-tickets", authMiddleware, requireAdmin, adminController.getSupportTickets);
router.patch("/support-tickets/:id", authMiddleware, requireRole(["SUPER_ADMIN", "CUSTOMER_SERVICE_ADMIN"]), adminController.updateSupportTicketStatus);
router.delete("/support-tickets/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.deleteSupportTicket);

// Admins Management
router.get("/admins", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.getAdmins);
router.post("/admins", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.createAdmin);
router.patch("/admins/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.updateAdmin);
router.delete("/admins/:id", authMiddleware, requireRole(["SUPER_ADMIN"]), adminController.deleteAdmin);

export default router;
