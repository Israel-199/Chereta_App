import {
  acceptAuctionTerms,
  initBidServiceFee,
  placeAuctionBid,
  verifyBidServiceFee,
} from "../api/chereta";

/** Fast path for mock Chapa; opens browser only when checkout URL is required. */
export async function placeBidWithTerms(auctionId: string, amount: number) {
  await acceptAuctionTerms(auctionId);
  const fee = await initBidServiceFee(auctionId, amount);
  if (fee.status !== "PAID") {
    if (fee.checkoutUrl) {
      const { Linking } = await import("react-native");
      await Linking.openURL(fee.checkoutUrl);
    }
    let paid = false;
    for (let i = 0; i < 15; i++) {
      const v = await verifyBidServiceFee(auctionId, fee.paymentId);
      if (v.status === "PAID") {
        paid = true;
        break;
      }
      if (v.status === "FAILED") break;
      await new Promise((r) => setTimeout(r, fee.mock ? 200 : 1500));
    }
    if (!paid) throw new Error("Service fee not completed");
  }
  await placeAuctionBid(auctionId, amount, fee.paymentId);
}
