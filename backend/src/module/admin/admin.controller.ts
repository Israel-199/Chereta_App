import prisma from "../../utils/prisma/prisma";
import { Request, Response } from "express";
import * as adminService from "./admin.service";
import cloudinary from "../../lib/cloudinary";
import { UploadApiResponse } from "cloudinary";
import bcrypt from "bcryptjs";

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

export async function getAllAuctions(req: Request, res: Response) {
  try {
    const auctions = await prisma.auctionItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bids: true } }
      }
    });
    res.status(200).json(auctions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAuctionDetails(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const auction = await prisma.auctionItem.findUnique({
      where: { id },
      include: {
        _count: { select: { bids: true } }
      }
    });
    res.status(200).json(auction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAuctionBids(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const bids = await prisma.bid.findMany({
      where: { auctionItemId: id },
      include: { user: { select: { firstName: true, lastName: true, phoneNumber: true, email: true, address: true } } },
      orderBy: { amount: 'asc' }
    });
    res.status(200).json(bids);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createAuction(req: Request, res: Response) {
  try {
    const {
      title,
      specs,
      category,
      categoryLabel,
      itemNumber,
      startTime,
      endTime,
      serviceFee,
      minBid,
      maxBid,
      bidStep,
    } = req.body;
    let images: string[] = [];
    let parsedSpecs = specs;
    if (typeof specs === "string") {
      try {
        parsedSpecs = JSON.parse(specs);
      } catch {
        parsedSpecs = {};
      }
    }

    if (req.files && Array.isArray(req.files)) {
      const filesWrapper = req.files as any[];
      for (const file of filesWrapper) {
        images.push(file.path); 
      }
    } else if (req.files && (req.files as any).images) {
      const filesWrapper = (req.files as any).images;
      for (const file of filesWrapper) {
        images.push(file.path);
      }
    }

    const auction = await prisma.auctionItem.create({
      data: {
        title,
        specs: parsedSpecs,
        category: category || "DIGITAL",
        categoryLabel: categoryLabel || null,
        itemNumber: itemNumber || null,
        images,
        serviceFee: serviceFee != null ? Number(serviceFee) : 75,
        minBid: minBid != null ? Number(minBid) : 1.01,
        maxBid: maxBid != null ? Number(maxBid) : 999.99,
        bidStep: bidStep != null ? Number(bidStep) : 0.01,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "ACTIVE",
      },
    });
    res.status(201).json(auction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateAuction(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const body = req.body;
    let images: string[] | undefined;
    if (req.files && (req.files as any).images) {
      images = [];
      for (const file of (req.files as any).images) {
        images.push(file.path);
      }
    }
    let parsedSpecs = body.specs;
    if (typeof body.specs === "string") {
      try {
        parsedSpecs = JSON.parse(body.specs);
      } catch {
        parsedSpecs = undefined;
      }
    }

    const data: any = {};
    if (body.title != null) data.title = body.title;
    if (body.category != null) data.category = body.category;
    if (body.categoryLabel != null) data.categoryLabel = body.categoryLabel;
    if (body.itemNumber != null) data.itemNumber = body.itemNumber;
    if (parsedSpecs != null) data.specs = parsedSpecs;

    let mergedImages: string[] | undefined;
    const imageJson = body.imagesUrls || body.existingImages;
    if (imageJson) {
      try {
        const parsed = typeof imageJson === "string" ? JSON.parse(imageJson) : imageJson;
        if (Array.isArray(parsed)) {
          mergedImages =
            body.replaceImages === "true" || body.replaceImages === true
              ? parsed.filter(Boolean)
              : parsed.filter(Boolean);
        }
      } catch {
        mergedImages = undefined;
      }
    }
    if (images?.length) {
      mergedImages = [...(mergedImages || []), ...images];
    }
    if (mergedImages) data.images = mergedImages;
    if (body.serviceFee != null) data.serviceFee = Number(body.serviceFee);
    if (body.minBid != null) data.minBid = Number(body.minBid);
    if (body.maxBid != null) data.maxBid = Number(body.maxBid);
    if (body.bidStep != null) data.bidStep = Number(body.bidStep);
    if (body.startTime != null) data.startTime = new Date(body.startTime);
    if (body.endTime != null) data.endTime = new Date(body.endTime);
    if (body.status != null) data.status = body.status;

    const auction = await prisma.auctionItem.update({ where: { id }, data });
    res.status(200).json(auction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCheretaPayments(req: Request, res: Response) {
  try {
    const payments = await prisma.cheretaServicePayment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { firstName: true, lastName: true, phoneNumber: true, email: true } },
        auctionItem: { select: { id: true, title: true, auctionCode: true } },
        bid: { select: { id: true, amount: true } },
      },
    });
    res.status(200).json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function resolveAuction(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { resolveAuctionWinner } = await import("../chereta/chereta.service");
    const auction = await resolveAuctionWinner(id);
    res.status(200).json(auction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateAuctionStatus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const auction = await prisma.auctionItem.update({
      where: { id },
      data: { status }
    });
    res.status(200).json(auction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteAuction(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    // ensure no bids or cascade delete?
    await prisma.bid.deleteMany({ where: { auctionItemId: id } });
    await prisma.auctionItem.delete({ where: { id } });
    res.status(200).json({ message: "Auction deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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




