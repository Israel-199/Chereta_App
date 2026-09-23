import { Request, Response } from "express";
import * as paymentService from "./payment.service";

export const makePayment = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      equbId,
      amount,
      cycleNumber,
      provider,
      transactionRef,
      dueDate,
    } = req.body;
    const payment = await paymentService.makePayment({
      userId,
      equbId,
      amount,
      cycleNumber,
      provider,
      transactionRef,
      dueDate,
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserContributions = async (req: Request, res: Response) => {
  try {
    let { userId } = req.params;

    if (Array.isArray(userId)) {
      userId = userId[0];
    }

    const total = await paymentService.getUserContributions(userId);
    res.status(200).json({ success: true, total });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const paymentWebhook = async (req: Request, res: Response) => {
  try {
    const { provider, payload } = req.body;
    await paymentService.handleWebhook(provider, payload);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
