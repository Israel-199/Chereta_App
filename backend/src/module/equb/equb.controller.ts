import { Request, Response } from "express";
import { EqubService } from "./equb.service";
import { EqubType, PayoutOrderType } from "@prisma/client";

const equbService = new EqubService();

export class EqubController {
  async createEqub(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admins only" });
      }
      const equb = await equbService.createEqub({
        name: req.body.name,
        contributionAmount: Number(req.body.contributionAmount),
        numberOfMembers: Number(req.body.numberOfMembers),
        type: EqubType[req.body.type as keyof typeof EqubType],
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        payoutOrderType:
          PayoutOrderType[
            req.body.payoutOrderType as keyof typeof PayoutOrderType
          ],
        inviteCode: req.body.inviteCode,
      });

      res.status(201).json(equb);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getEqubs(req: Request, res: Response) {
    const userId = req.user?.id;
    const role = req.user?.role;
    const equbs = await equbService.getEqubsForUser(userId!, role!);
    res.json(equbs);
  }

  async getMyEqubs(req: Request, res: Response) {
    const userId = req.user?.id;
    const role = req.user?.role;
    const equbs = await equbService.getMyEqubs(userId!, role!);
    res.json(equbs);
  }

  async getEqubById(req: Request, res: Response) {
    const userId = req.user?.id;
    const role = req.user?.role;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const equb = await equbService.getEqubByIdForUser(id, userId!, role!);
    if (!equb) return res.status(404).json({ message: "Equb not found" });
    res.json(equb);
  }

  async updateEqub(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admins only" });
      }

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const equb = await equbService.updateEqub(id, {
        name: req.body.name,
        contributionAmount: req.body.contributionAmount
          ? Number(req.body.contributionAmount)
          : undefined,
        numberOfMembers: req.body.numberOfMembers
          ? Number(req.body.numberOfMembers)
          : undefined,
        type: req.body.type
          ? EqubType[req.body.type as keyof typeof EqubType]
          : undefined,
        startDate: req.body.startDate
          ? new Date(req.body.startDate)
          : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        payoutOrderType: req.body.payoutOrderType
          ? PayoutOrderType[
              req.body.payoutOrderType as keyof typeof PayoutOrderType
            ]
          : undefined,
        inviteCode: req.body.inviteCode,
      });

      res.json(equb);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async joinEqub(req: Request, res: Response) {
    try {
      const equbId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const member = await equbService.joinEqub(equbId, userId);
      res.status(200).json(member);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async leaveEqub(req: Request, res: Response) {
    try {
      const equbId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await equbService.leaveEqub(equbId, userId);
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async deleteEqub(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admins only" });
      }
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await equbService.deleteEqub(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteAllEqubs(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admins only" });
      }
      await equbService.deleteAllEqubs();
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getHistoryStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const stats = await equbService.getHistoryStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getCompletedEqubs(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const equbs = await equbService.getCompletedEqubs(userId);
      res.json(equbs);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAvailableEqubTypes(req: Request, res: Response) {
    try {
      const types = await equbService.getAvailableEqubTypes();
      res.json(types);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ---- Equb Share Marketplace ----

  async getListings(req: Request, res: Response) {
    try {
      const equbId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const listings = await equbService.getListingsForEqub(equbId, userId);
      res.json(listings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getMyListings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const listings = await equbService.getMyListings(userId);
      res.json(listings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async createListing(req: Request, res: Response) {
    try {
      const equbId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const { sellingPrice } = req.body;

      if (!sellingPrice || isNaN(Number(sellingPrice))) {
        return res.status(400).json({ message: "Selling price is required and must be a number" });
      }

      const listing = await equbService.createListing(equbId, userId, Number(sellingPrice));
      res.status(201).json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async buyListing(req: Request, res: Response) {
    try {
      const equbId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const listingId = Array.isArray(req.params.listingId) ? req.params.listingId[0] : req.params.listingId;
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const listing = await equbService.buyListing(equbId, listingId, userId);
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async cancelListing(req: Request, res: Response) {
    try {
      const listingId = Array.isArray(req.params.listingId) ? req.params.listingId[0] : req.params.listingId;
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const listing = await equbService.cancelListing(listingId, userId);
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getLotteryStatus(req: Request, res: Response) {
    try {
      res.setHeader("Cache-Control", "public, max-age=10, stale-while-revalidate=30");
      const equbId = (req.query.equbId as string) || (req.params.id as string) || "default";
      const status = await equbService.getLotteryRoundStatus(equbId);
      res.json(status);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

