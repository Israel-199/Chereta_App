import api from "./axiosClient";

export type AuctionItem = {
  id: string;
  auctionCode?: string;
  title: string;
  category: "DIGITAL" | "APPLIANCE";
  categoryLabel?: string;
  itemNumber?: string;
  specs?: Record<string, string>;
  images: string[];
  serviceFee?: number;
  minBid?: number;
  maxBid?: number;
  bidStep?: number;
  viewCount?: number;
  startTime: string;
  endTime: string;
  status: string;
  bidCount?: number;
  termsAcceptedCount?: number;
  userHasBid?: boolean;
  serverTime?: string;
};

export async function acceptAuctionTerms(auctionId: string) {
  const { data } = await api.post(`/chereta/${auctionId}/accept-terms`);
  return data as { termsAcceptedCount: number };
}

export async function fetchActiveAuctions() {
  const { data } = await api.get("/chereta");
  if (Array.isArray(data)) {
    return { serverTime: new Date().toISOString(), auctions: data as AuctionItem[] };
  }
  return {
    serverTime: data?.serverTime ?? new Date().toISOString(),
    auctions: Array.isArray(data?.auctions) ? (data.auctions as AuctionItem[]) : [],
  };
}

export async function fetchAuctionResults(id: string) {
  const { data } = await api.get(`/chereta/${id}/results`);
  return data as {
    auction: AuctionItem;
    winner: {
      phone: string;
      category: string;
      bidAmount: number;
      auctionCode: number;
      userId: string;
    } | null;
    duplicateLosers: {
      phone: string;
      category: string;
      bidAmount: number;
      auctionCode: number;
      userId: string;
    }[];
    viewerStatus: "NO_BID" | "WON" | "LOST_DUPLICATE" | "LOST";
  };
}

export async function fetchAuctionById(id: string) {
  const { data } = await api.get(`/chereta/${id}`);
  return data as AuctionItem;
}

export async function initBidServiceFee(auctionId: string, bidAmount: number) {
  const { data } = await api.post(`/chereta/${auctionId}/service-fee/init`, { bidAmount });
  return data as {
    paymentId: string;
    txRef: string;
    amount: number;
    status: string;
    checkoutUrl: string | null;
    mock?: boolean;
  };
}

export async function verifyBidServiceFee(auctionId: string, paymentId: string) {
  const { data } = await api.post(`/chereta/${auctionId}/service-fee/verify`, { paymentId });
  return data as { paymentId: string; status: string };
}

export async function placeAuctionBid(id: string, amount: number, servicePaymentId: string) {
  const { data } = await api.post(`/chereta/${id}/bid`, { amount, servicePaymentId });
  return data;
}

export async function fetchWinners() {
  const { data } = await api.get("/chereta/winners");
  if (Array.isArray(data)) {
    return { serverTime: new Date().toISOString(), winners: data };
  }
  return {
    serverTime: data?.serverTime ?? new Date().toISOString(),
    winners: Array.isArray(data?.winners) ? data.winners : [],
  };
}

export async function fetchMyBids() {
  const { data } = await api.get("/chereta/my-bids");
  return data as any[];
}
