import { Router } from "express";
import * as paymentController from "./payment.controller";

const router = Router();

router.post("/", paymentController.makePayment);
router.get("/contributions/:userId", paymentController.getUserContributions);
router.post("/webhook", paymentController.paymentWebhook);

export default router;
