import { Request, Response } from "express";
import * as CheretaPaymentService from "../chereta/chereta.payment.service";

/** Chapa server callback (configure in Chapa dashboard when keys are ready). */
export async function chapaWebhook(req: Request, res: Response) {
  try {
    const txRef = req.body?.tx_ref || req.query?.tx_ref;
    if (!txRef || typeof txRef !== "string") {
      return res.status(400).json({ message: "tx_ref required" });
    }
    const result = await CheretaPaymentService.handleChapaWebhook(txRef);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function chapaConfig(_req: Request, res: Response) {
  const { isChapaConfigured, isChapaMockMode } = await import("../../lib/chapa");
  res.json({
    provider: "CHAPA",
    configured: isChapaConfigured(),
    mockMode: isChapaMockMode(),
  });
}
