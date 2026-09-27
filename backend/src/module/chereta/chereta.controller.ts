import { Request, Response } from "express";
import * as CheretaService from "./chereta.service";
import * as CheretaPaymentService from "./chereta.payment.service";
import { isChapaMockMode, isChapaConfigured } from "../../lib/chapa";
import { isMissingColumnError } from "../../utils/prismaErrors";
import { getOptionalUserId } from "../../utils/optionalUser";

export const getAllAuctions = async (req: Request, res: Response) => {
  try {
    const userId = getOptionalUserId(req);
    const auctions = await CheretaService.getActiveAuctions(userId);
    res.json({ serverTime: new Date().toISOString(), auctions });
  } catch (err: any) {
    if (isMissingColumnError(err)) {
      return res.json({
        serverTime: new Date().toISOString(),
        auctions: [],
        schemaOutdated: true,
        hint: "Run npm run db:repair-chereta on the backend",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

export const getAuctionResults = async (req: Request, res: Response) => {
  try {
    const userId = getOptionalUserId(req);
    const data = await CheretaService.getAuctionResults(req.params.id as string, userId);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getAuctionDetails = async (req: Request, res: Response) => {
  try {
    const auction = await CheretaService.getAuctionById(req.params.id as string, true);
    if (!auction) return res.status(404).json({ message: "Not found" });
    res.json(auction);
  } catch (err: any) {
    if (isMissingColumnError(err)) {
      return res.status(503).json({
        message: "Database schema outdated. Run npm run db:repair-chereta",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

export const acceptAuctionTerms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const auctionId = req.params.id as string;
    const result = await CheretaService.acceptAuctionTerms(userId, auctionId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const placeBid = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, servicePaymentId } = req.body;
    const auctionId = req.params.id as string;
    const result = await CheretaService.placeBid(
      userId,
      auctionId,
      Number(amount),
      servicePaymentId,
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getWinners = async (req: Request, res: Response) => {
  try {
    const winners = await CheretaService.getWinners();
    res.json({ serverTime: new Date().toISOString(), winners });
  } catch (err: any) {
    if (isMissingColumnError(err)) {
      return res.json({ serverTime: new Date().toISOString(), winners: [] });
    }
    res.status(500).json({ message: err.message });
  }
};

export const getBidHistory = async (req: Request, res: Response) => {
  try {
    const bids = await CheretaService.getBidHistory(req.params.id as string);
    res.json(bids);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyBids = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const bids = await CheretaService.getUserBids(userId);
    res.json(bids);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const initBidServiceFee = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const auctionId = req.params.id as string;
    const { bidAmount } = req.body;
    const result = await CheretaPaymentService.initServiceFeePayment(
      userId,
      auctionId,
      Number(bidAmount),
    );
    res.json({
      ...result,
      chapaConfigured: isChapaConfigured(),
      mockMode: isChapaMockMode(),
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyBidServiceFee = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { paymentId } = req.body;
    const result = await CheretaPaymentService.verifyServiceFeePayment(userId, paymentId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const adminCreateAuction = async (req: Request, res: Response) => {
  try {
    const auction = await CheretaService.createAuction(req.body);
    res.json(auction);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
