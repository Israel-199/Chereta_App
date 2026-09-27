import axios from "axios";
import crypto from "crypto";

const CHAPA_BASE = "https://api.chapa.co/v1";

export function isChapaConfigured() {
  return Boolean(process.env.CHAPA_SECRET_KEY?.trim());
}

export function isChapaMockMode() {
  return process.env.CHAPA_MOCK === "true" || !isChapaConfigured();
}

export function generateTxRef(prefix = "CHRT") {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

export type ChapaInitInput = {
  amount: number;
  currency?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  txRef: string;
  callbackUrl?: string;
  returnUrl?: string;
  title?: string;
};

export async function initializeTransaction(input: ChapaInitInput) {
  if (isChapaMockMode()) {
    return {
      mock: true,
      checkout_url: null as string | null,
      data: { tx_ref: input.txRef, status: "success" },
    };
  }

  const secret = process.env.CHAPA_SECRET_KEY!;
  const res = await axios.post(
    `${CHAPA_BASE}/transaction/initialize`,
    {
      amount: String(input.amount),
      currency: input.currency || "ETB",
      email: input.email,
      first_name: input.firstName || "Chereta",
      last_name: input.lastName || "User",
      phone_number: input.phone,
      tx_ref: input.txRef,
      callback_url: input.callbackUrl || process.env.CHAPA_CALLBACK_URL,
      return_url: input.returnUrl || process.env.CHAPA_RETURN_URL,
      customization: {
        title: input.title || "Chereta Bid Service Fee",
        description: "Bid service fee payment",
      },
    },
    {
      headers: { Authorization: `Bearer ${secret}` },
    },
  );

  return res.data;
}

export async function verifyTransaction(txRef: string) {
  if (isChapaMockMode()) {
    return { mock: true, status: "success", data: { status: "success", tx_ref: txRef } };
  }

  const secret = process.env.CHAPA_SECRET_KEY!;
  const res = await axios.get(`${CHAPA_BASE}/transaction/verify/${encodeURIComponent(txRef)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  return res.data;
}

export function isSuccessfulVerification(payload: any): boolean {
  const status = payload?.data?.status || payload?.status;
  return status === "success" || status === "successful";
}
