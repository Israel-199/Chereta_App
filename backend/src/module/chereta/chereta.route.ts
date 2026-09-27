import { Router } from "express";
import {
  getAllAuctions,
  getAuctionDetails,
  getAuctionResults,
  placeBid,
  getWinners,
  getBidHistory,
  getMyBids,
  initBidServiceFee,
  verifyBidServiceFee,
  acceptAuctionTerms,
  adminCreateAuction
} from "./chereta.controller";


const router = Router();

import { authMiddleware as auth } from "../../middleware/authMiddleware";

router.get("/", getAllAuctions);
router.get("/winners", getWinners);
router.get("/my-bids", auth, getMyBids);
router.get("/:id/results", getAuctionResults);
router.get("/:id/bids", getBidHistory);
router.get("/:id", getAuctionDetails);
router.post("/:id/accept-terms", auth, acceptAuctionTerms);
router.post("/:id/service-fee/init", auth, initBidServiceFee);
router.post("/:id/service-fee/verify", auth, verifyBidServiceFee);
router.post("/:id/bid", auth, placeBid);

router.post("/", auth, adminCreateAuction); 

export default router;
