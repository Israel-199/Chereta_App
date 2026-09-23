import { Request, Response } from "express";
import { SupportService } from "./support.service";

const supportService = new SupportService();

export class SupportController {
  async createTicket(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { subject, message } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
      }

      const ticket = await supportService.createTicket(userId, subject, message);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getMyTickets(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const tickets = await supportService.getMyTickets(userId);
      res.json(tickets);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteTicket(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      await supportService.deleteTicket(id as string, userId);
      res.json({ message: "Ticket deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
