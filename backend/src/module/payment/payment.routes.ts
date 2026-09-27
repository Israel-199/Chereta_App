import { Router } from "express";
import * as paymentController from "./payment.controller";
import * as chapaController from "./chapa.controller";

const router = Router();

router.post("/", paymentController.makePayment);
router.get("/contributions/:userId", paymentController.getUserContributions);
router.post("/webhook", paymentController.paymentWebhook);

router.get("/chapa/config", chapaController.chapaConfig);
router.post("/chapa/webhook", chapaController.chapaWebhook);

export default router;
