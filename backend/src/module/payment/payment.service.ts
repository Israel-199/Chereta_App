import { PaymentProvider } from "@prisma/client";
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

/** Legacy Equb payments removed — Chereta uses bid service fees separately. */
export const makePayment = async (_input: PaymentInput) => {
  throw new Error("Equb payments are no longer supported in Chereta");
};

export const getUserContributions = async (_userId: string) => {
  return 0;
};

export const handleWebhook = async (
  provider: PaymentProvider,
  payload: any,
) => {
  if (!ALLOWED_PROVIDERS.includes(provider)) {
    throw new Error(`Webhook from unsupported provider: ${provider}`);
  }

  const { status } = payload;

  await prisma.webhookLog.create({
    data: {
      provider,
      payload,
      failedReason: status === "FAILED" ? "Provider reported failure" : null,
    },
  });
};
