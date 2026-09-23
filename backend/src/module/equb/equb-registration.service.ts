import prisma from "../../utils/prisma/prisma";
import { EqubType } from "@prisma/client";

export class EqubRegistrationService {
  async register(userId: string, data: { fullName: string, phoneNumber: string, address: string, monthlyIncome: string, type: EqubType }) {
    return prisma.equbRegistration.create({
      data: {
        userId,
        ...data
      }
    });
  }

  async checkRegistration(userId: string, type: EqubType) {
    return prisma.equbRegistration.findUnique({
      where: {
        userId_type: {
          userId,
          type
        }
      }
    });
  }
}
