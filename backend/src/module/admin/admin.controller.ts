import prisma from "../../utils/prisma/prisma";
import { Request, Response } from "express";
import * as adminService from "./admin.service";
import { EqubService } from "../equb/equb.service";
import cloudinary from "../../lib/cloudinary";
import { UploadApiResponse } from "cloudinary";
import bcrypt from "bcryptjs";

const equbService = new EqubService();

export async function getStats(req: Request, res: Response) {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const { status, idStatus, search, equbType, equbAmount } = req.query;
    const users = await adminService.getUsers({ status, idStatus, search, equbType, equbAmount });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function verifyKyc(req: Request, res: Response) {
  try {
    const { userId, status } = req.body;
    if (!userId || !status) {
      return res.status(400).json({ error: "UserId and status are required" });
    }
    const updatedUser = await adminService.updateKycStatus(userId, status);
    const title = status === "VERIFIED" ? "Identity Verified" : "Verification Rejected";
    const message = status === "VERIFIED" 
      ? "Successfully verify your identity. You now have full access to platform features."
      : "Your identity not verified, please fill the form again. Make sure your ID photo is clear and readable.";
    await prisma.notificationLog.create({
      data: {
        userId,
        type: "PAYOUT_CONFIRMED", 
        channel: "IN_APP",
        status: "SENT",
        createdAt: new Date()
      }
    });

    await prisma.adminActionLog.create({
      data: {
        adminId: (req as any).user?.id || "SYSTEM",
        action: `KYC_${status}`,
        target: "USER",
        targetId: userId,
        reason: `KYC Review: ${status}`
      }
    });

    if (status === "REJECTED") {
      const attachments = await prisma.attachment.findMany({
        where: { userId }
      });

      for (const attachment of attachments) {
        if (attachment.publicId) {
          try {
            await cloudinary.uploader.destroy(attachment.publicId);
          } catch (cloudErr) {
            console.error(`Failed to delete Cloudinary asset ${attachment.publicId}:`, cloudErr);
          }
        }
      }

      await prisma.attachment.deleteMany({
        where: { userId }
      });
      console.log(`Cleaned up ${attachments.length} attachments for rejected user: ${userId}`);
    }

    res.status(200).json({ message: `KYC status updated to ${status}`, user: updatedUser });
  } catch (error: any) {
    console.error("verifyKyc error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function toggleUserStatus(req: Request, res: Response) {
  try {
    const { userId, status, reason } = req.body;
    const updatedUser = await adminService.toggleUserStatus(userId, status, reason);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { page, limit, search, origin } = req.query;
    const logs = await adminService.getAuditLogs({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      origin: origin as string
    });
    res.status(200).json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function sendNotification(req: Request, res: Response) {
  try {
    const { title, message, target, userIds } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }
    const result = await adminService.broadcastNotification(title, message, target, userIds);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getEqubRegistrations(req: Request, res: Response) {
  try {
    const registrations = await adminService.getEqubRegistrations();
    res.status(200).json(registrations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllEqubs(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const role = (req as any).user?.role;
    const equbs = await equbService.getEqubsForUser(userId!, role!);
    res.status(200).json(equbs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function drawWinner(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await equbService.performDraw(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function pauseEqub(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { reason } = req.body;
    const result = await equbService.toggleEqubPause(id, reason);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function createEqub(req: Request, res: Response) {
  try {
    const data = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files && files['frontImage'] && files['frontImage'][0]) {
      const frontFile = files['frontImage'][0];
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `equbs/front`, resource_type: "auto" },
          (error, result) => error ? reject(error) : resolve(result!)
        );
        stream.end(frontFile.buffer);
      });
      data.frontImage = result.secure_url;
    }

    if (files && files['backImage'] && files['backImage'][0]) {
      const backFile = files['backImage'][0];
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `equbs/back`, resource_type: "auto" },
          (error, result) => error ? reject(error) : resolve(result!)
        );
        stream.end(backFile.buffer);
      });
      data.backImage = result.secure_url;
    }

    if (data.contributionAmount) data.contributionAmount = Number(data.contributionAmount);
    if (data.numberOfMembers) data.numberOfMembers = Number(data.numberOfMembers);
    if (data.total) data.total = Number(data.total);
    if (data.sellingPrice) data.sellingPrice = Number(data.sellingPrice);

    const result = await equbService.createEqub(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateEqub(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files && files['frontImage'] && files['frontImage'][0]) {
      const frontFile = files['frontImage'][0];
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `equbs/front`, resource_type: "auto" },
          (error, result) => error ? reject(error) : resolve(result!)
        );
        stream.end(frontFile.buffer);
      });
      data.frontImage = result.secure_url;
    }

    if (files && files['backImage'] && files['backImage'][0]) {
      const backFile = files['backImage'][0];
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `equbs/back`, resource_type: "auto" },
          (error, result) => error ? reject(error) : resolve(result!)
        );
        stream.end(backFile.buffer);
      });
      data.backImage = result.secure_url;
    }

    if (data.contributionAmount) data.contributionAmount = Number(data.contributionAmount);
    if (data.numberOfMembers) data.numberOfMembers = Number(data.numberOfMembers);
    if (data.total) data.total = Number(data.total);
    if (data.sellingPrice) data.sellingPrice = Number(data.sellingPrice);

    const result = await equbService.updateEqub(id, data);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function getPayouts(req: Request, res: Response) {
  try {
    const payouts = await adminService.getPayouts();
    res.status(200).json(payouts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAttachments(req: Request, res: Response) {
  try {
    const attachments = await adminService.getAttachments();
    res.status(200).json(attachments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteAttachment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const attachment: any = await adminService.deleteAttachment(id as string);
    if (attachment && attachment.publicId) {
      await cloudinary.uploader.destroy(attachment.publicId);
    }
    res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSupportTickets(req: Request, res: Response) {
  try {
    const tickets = await adminService.getSupportTickets();
    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateSupportTicketStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['OPEN', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    await adminService.updateSupportTicketStatus(id as string, status as any);
    res.status(200).json({ message: "Ticket status updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteSupportTicket(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await adminService.deleteSupportTicket(id as string);
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getPlatformMonitoring(req: Request, res: Response) {
  try {
    const stats = await adminService.getPlatformMonitoring();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function forceAddMember(req: Request, res: Response) {
  try {
    const { equbId, userId } = req.body;
    const result = await equbService.joinEqub(equbId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function forceRemoveMember(req: Request, res: Response) {
  try {
    const { equbId, userId } = req.body;
    const result = await equbService.leaveEqub(equbId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function deleteRegistration(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await adminService.deleteRegistration(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
export async function deleteEqub(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await equbService.deleteEqub(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function getSidebarCounts(req: Request, res: Response) {
  try {
    const counts = await adminService.getSidebarCounts();
    res.status(200).json(counts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// -----------------------------
// Admins Management
// -----------------------------
export async function getAdmins(req: Request, res: Response) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'FINANCE_ADMIN', 'CUSTOMER_SERVICE_ADMIN', 'ADMIN'] } },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, status: true }
    });
    res.status(200).json(admins);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createAdmin(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required." });
    }
    const hash = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        firstName,
        lastName,
        role,
        status: "ACTIVE",
        verifiedAt: new Date()
      }
    });
    res.status(201).json(newAdmin);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateAdmin(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { role, password, status, firstName, lastName, email } = req.body;
    const data: any = {};
    if (role) data.role = role;
    if (status) data.status = status;
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (email) data.email = email;
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id },
      data
    });
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteAdmin(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// -----------------------------
// Financial Transactions 
// -----------------------------
export async function getPayments(req: Request, res: Response) {
  try {
    const payments = await prisma.payment.findMany({
      include: { user: true, equb: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // e.g. COMPLETED or REJECTED
    const payment = await prisma.payment.update({
      where: { id },
      data: { status }
    });
    
    await prisma.adminActionLog.create({
      data: {
        adminId: (req as any).user?.id || "SYSTEM",
        action: `PAYMENT_${status}`,
        target: "PAYMENT",
        targetId: id,
        reason: `Payment verified by Finance Admin`
      }
    });

    res.status(200).json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function verifyPayout(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body; 
    
    // In DB, payout status isn't an explicit enum like PaymentStatus currently,
    // so we handle it by setting confirmedAt time and confirmedBy user.
    const payout = await prisma.payout.update({
      where: { id },
      data: { 
        confirmedAt: status === 'COMPLETED' ? new Date() : null,
        confirmedByUserId: status === 'COMPLETED' ? ((req as any).user?.id || undefined) : null
      }
    });

    await prisma.adminActionLog.create({
      data: {
        adminId: (req as any).user?.id || "SYSTEM",
        action: `PAYOUT_${status}`,
        target: "PAYOUT",
        targetId: id,
        reason: `Payout verified by Finance Admin`
      }
    });

    res.status(200).json(payout);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function setAttachmentStatus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // e.g. APPROVED or REJECTED
    
    // We added AttachmentStatus to schema, so we can native update here.
    const updated = await prisma.attachment.update({
      where: { id },
      data: { status }
    });
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// -----------------------------
// Equb Share Marketplace
// -----------------------------

export async function getAllListings(req: Request, res: Response) {
  try {
    const listings = await prisma.equbShareListing.findMany({
      include: {
        seller: { select: { id: true, firstName: true, lastName: true, userCode: true } },
        buyer: { select: { id: true, firstName: true, lastName: true, userCode: true } },
        equb: { select: { id: true, name: true, contributionAmount: true, numberOfMembers: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(listings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function adminUpdateListingStatus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['ACTIVE', 'SOLD', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: "Invalid listing status" });
    }

    const updatedListing = await prisma.equbShareListing.update({
      where: { id },
      data: { status }
    });

    await prisma.adminActionLog.create({
      data: {
        adminId: (req as any).user?.id || "SYSTEM",
        action: `LISTING_${status}`,
        target: "EQUB_SHARE_LISTING",
        targetId: id,
        reason: `Listing status updated by admin`
      }
    });

    res.status(200).json(updatedListing);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function adminDeleteListing(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    await prisma.equbShareListing.delete({
      where: { id }
    });

    await prisma.adminActionLog.create({
      data: {
        adminId: (req as any).user?.id || "SYSTEM",
        action: `LISTING_DELETED`,
        target: "EQUB_SHARE_LISTING",
        targetId: id,
        reason: `Listing deleted by admin`
      }
    });

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getEqubMembersDetail(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const details = await equbService.getEqubMembersDetail(id);
    res.status(200).json(details);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

