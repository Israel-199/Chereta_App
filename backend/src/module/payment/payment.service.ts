import { PaymentProvider, PaymentStatus } from "@prisma/client";
import prisma from "../../utils/prisma/prisma";

const ALLOWED_PROVIDERS: PaymentProvider[] = [
  PaymentProvider.TELEBIRR,
  PaymentProvider.CBE,
  PaymentProvider.DASHEN,
  PaymentProvider.COOP,
  PaymentProvider.AMHARA,
  PaymentProvider.ABYISINIA,
  PaymentProvider.AWASH,
  PaymentProvider.SAFARICOM,
  PaymentProvider.MASTERCARD,
];

interface PaymentInput {
  userId: string;
  equbId: string;
  amount: number;
  cycleNumber: number;
  provider: PaymentProvider;
  transactionRef: string;
  dueDate: Date;
}

export const makePayment = async (input: PaymentInput) => {
  const {
    userId,
    equbId,
    amount,
    cycleNumber,
    provider,
    transactionRef,
    dueDate,
  } = input;

  if (!ALLOWED_PROVIDERS.includes(provider)) {
    throw new Error(`Provider ${provider} is not supported`);
  }

  const membership = await prisma.equbMember.findUnique({
    where: { equbId_userId: { equbId, userId } },
  });
  if (!membership) throw new Error("User is not a member of this Equb");

  return prisma.payment.create({
    data: {
      userId,
      equbId,
      amount,
      cycleNumber,
      provider,
      transactionRef,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
      dueDate,
    },
  });
};

export const getUserContributions = async (userId: string) => {
  const result = await prisma.payment.aggregate({
    where: { userId, status: PaymentStatus.PAID },
    _sum: { amount: true },
  });
  return result._sum.amount || 0;
};

export const handleWebhook = async (
  provider: PaymentProvider,
  payload: any,
) => {
  if (!ALLOWED_PROVIDERS.includes(provider)) {
    throw new Error(`Webhook from unsupported provider: ${provider}`);
  }

  const { transactionRef, status } = payload;

  await prisma.payment.update({
    where: { transactionRef },
    data: {
      status: status as PaymentStatus,
      paidAt: status === "PAID" ? new Date() : undefined,
    },
  });

  await prisma.webhookLog.create({
    data: {
      provider,
      payload,
      failedReason: status === "FAILED" ? "Provider reported failure" : null,
    },
  });
};
