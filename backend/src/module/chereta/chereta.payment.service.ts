import prisma from "../../utils/prisma/prisma";
import {
  generateTxRef,
  initializeTransaction,
  isChapaMockMode,
  isSuccessfulVerification,
  verifyTransaction,
} from "../../lib/chapa";
import { PaymentProvider } from "@prisma/client";

export async function initServiceFeePayment(
  userId: string,
  auctionItemId: string,
  bidAmount: number,
) {
  const [user, auction] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.auctionItem.findUnique({ where: { id: auctionItemId } }),
  ]);

  if (!user) throw new Error("User not found");
  if (!auction || auction.status !== "ACTIVE") throw new Error("Auction is not active");

  const fee = auction.serviceFee ?? 75;
  const txRef = generateTxRef();

  const payment = await prisma.cheretaServicePayment.create({
    data: {
      userId,
      auctionItemId,
      bidAmount,
      amount: fee,
      txRef,
      status: "PENDING",
    },
  });

  const email = user.email || `${(user.phoneNumber || "user").replace(/\D/g, "")}@chereta.app`;

  const chapa = await initializeTransaction({
    amount: fee,
    email,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    phone: user.phoneNumber || undefined,
    txRef,
    title: `Bid fee — ${auction.title}`,
  });

  const checkoutUrl = chapa?.data?.checkout_url || null;

  if (isChapaMockMode()) {
    const paid = await prisma.cheretaServicePayment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        checkoutUrl: null,
        chapaRef: "MOCK",
      },
    });
    return {
      paymentId: paid.id,
      txRef: paid.txRef,
      amount: paid.amount,
      status: paid.status,
      checkoutUrl: null as string | null,
      mock: true,
    };
  }

  const updated = await prisma.cheretaServicePayment.update({
    where: { id: payment.id },
    data: { checkoutUrl: checkoutUrl || undefined },
  });

  return {
    paymentId: updated.id,
    txRef: updated.txRef,
    amount: updated.amount,
    status: updated.status,
    checkoutUrl,
    mock: false,
  };
}

export async function verifyServiceFeePayment(userId: string, paymentId: string) {
  const payment = await prisma.cheretaServicePayment.findFirst({
    where: { id: paymentId, userId },
  });
  if (!payment) throw new Error("Payment not found");

  if (payment.status === "PAID") {
    return { paymentId: payment.id, status: payment.status, txRef: payment.txRef };
  }

  const result = await verifyTransaction(payment.txRef);
  if (!isSuccessfulVerification(result)) {
    await prisma.cheretaServicePayment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return { paymentId: payment.id, status: "FAILED", txRef: payment.txRef };
  }

  const paid = await prisma.cheretaServicePayment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      chapaRef: result?.data?.reference || payment.chapaRef,
    },
  });

  await prisma.webhookLog.create({
    data: {
      provider: PaymentProvider.CHAPA,
      payload: result,
    },
  });

  return { paymentId: paid.id, status: paid.status, txRef: paid.txRef };
}

export async function handleChapaWebhook(txRef: string) {
  const payment = await prisma.cheretaServicePayment.findUnique({ where: { txRef } });
  if (!payment) return { ok: false, reason: "unknown_tx_ref" };

  const result = await verifyTransaction(txRef);
  await prisma.webhookLog.create({
    data: { provider: PaymentProvider.CHAPA, payload: result },
  });

  if (!isSuccessfulVerification(result)) {
    await prisma.cheretaServicePayment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return { ok: false, reason: "not_successful" };
  }

  await prisma.cheretaServicePayment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      chapaRef: result?.data?.reference || payment.chapaRef,
    },
  });

  return { ok: true };
}

export async function assertPaidServiceFee(
  userId: string,
  auctionItemId: string,
  servicePaymentId: string,
  bidAmount: number,
) {
  const payment = await prisma.cheretaServicePayment.findFirst({
    where: {
      id: servicePaymentId,
      userId,
      auctionItemId,
      status: "PAID",
      bid: null,
    },
  });

  if (!payment) {
    throw new Error("Valid paid service fee required before placing a bid");
  }

  if (Math.abs(payment.bidAmount - bidAmount) > 0.001) {
    throw new Error("Bid amount does not match the paid service fee session");
  }

  return payment;
}
