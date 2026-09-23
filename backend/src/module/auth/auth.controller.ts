import { Request, Response } from "express";
import * as authService from "./auth.service";

const ethiopianPhoneRegex = /^(?:\+2519\d{8}|09\d{8})$/;

function validatePhoneNumber(phoneNumber: string): boolean {
  return ethiopianPhoneRegex.test(phoneNumber);
}

export async function requestOtp(req: Request, res: Response) {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber)
      return res.status(400).json({ errorKey: "phoneRequired" });
    if (!validatePhoneNumber(phoneNumber))
      return res.status(400).json({ errorKey: "invalidPhone" });

    const result = await authService.sendOtp(phoneNumber);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ errorKey: err.message });
  }
}

export async function resendOtp(req: Request, res: Response) {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber)
      return res.status(400).json({ errorKey: "phoneRequired" });

    const result = await authService.resendOtp(phoneNumber);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ errorKey: err.message });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { phoneNumber, code, deviceId } = req.body;
    if (!phoneNumber || !code || !deviceId)
      return res.status(400).json({ errorKey: "missingFields" });

    const result = await authService.verifyOtp(phoneNumber, code, deviceId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ errorKey: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ errorKey: "noToken" });

    const token = authHeader.split(" ")[1];
    const result = await authService.logout(token);

    res.json(result);
  } catch (err: any) {
    res.status(401).json({ errorKey: "logoutFailed" });
  }
}

export async function loginAdmin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ errorKey: "missingFields" });
    }

    const ip = req.ip || req.get("x-forwarded-for") || req.socket.remoteAddress;
    const userAgent = req.get("user-agent");

    const result = await authService.loginAdmin(email, password, ip, userAgent);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ errorKey: err.message });
  }
}

export async function updateAdminProfile(req: Request, res: Response) {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;
    const adminId = (req as any).user?.id;

    if (!currentPassword) {
      return res.status(400).json({ errorKey: "currentPasswordRequired" });
    }

    const result = await authService.updateAdminProfile(adminId, currentPassword, newEmail, newPassword);
    res.status(200).json({ message: "Profile updated successfully", user: { email: result.email } });
  } catch (err: any) {
    res.status(400).json({ errorKey: err.message });
  }
}
