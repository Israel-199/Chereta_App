import prisma from "../../utils/prisma/prisma";

export class SupportService {
  async createTicket(userId: string, subject: string, message: string) {
    return await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
      },
    });
  }

  async getMyTickets(userId: string) {
    return await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteTicket(id: string, userId: string) {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId }
    });

    if (!ticket) {
      throw new Error("Ticket not found or unauthorized");
    }

    return await prisma.supportTicket.delete({
      where: { id }
    });
  }
}
