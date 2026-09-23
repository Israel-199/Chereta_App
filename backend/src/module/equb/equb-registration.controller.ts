import { Request, Response } from "express";
import { EqubRegistrationService } from "./equb-registration.service";
import { EqubType } from "@prisma/client";

const registrationService = new EqubRegistrationService();

export class EqubRegistrationController {
  async register(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { fullName, phoneNumber, address, monthlyIncome, type } = req.body;
      if (!isNaN(Number(fullName)) || !isNaN(Number(address))) {
        return res.status(400).json({ message: "Full name and address must be valid text" });
      }

      const ethPhoneRegex = /^(?:\+251|0)[1-9]\d{8}$/;
      if (!ethPhoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: "Invalid Ethiopian phone number" });
      }

      const incomeNumeric = Number(String(monthlyIncome).replace(/,/g, ''));
      if (isNaN(incomeNumeric)) {
        return res.status(400).json({ message: "Monthly income must be a valid number" });
      }

      const registration = await registrationService.register(userId, {
        fullName,
        phoneNumber,
        address,
        monthlyIncome: incomeNumeric.toString(),
        type: type as EqubType
      });

      res.status(201).json({ 
        message: `Welcome ${fullName}! Your registration for ${type.toLowerCase()} equb was successful.`,
        ...registration 
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ message: "Already registered for this equb type" });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async checkRegistration(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { type } = req.query;
      const registration = await registrationService.checkRegistration(userId, type as EqubType);

      res.json({ isRegistered: !!registration, registration });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
