import prisma from "../../utils/prisma/prisma";
import { AuctionCategory, AuctionStatus } from "@prisma/client";

export const syncExpiredAuctions = async () => {
  const now = new Date();
  const expired = await prisma.auctionItem.findMany({
    where: {
      status: "ACTIVE",
      endTime: { lte: now },
    },
  });

  for (const auction of expired) {
    await resolveAuctionWinner(auction.id);
  }
};

export const resolveAuctionWinner = async (auctionItemId: string) => {
  const auction = await prisma.auctionItem.findUnique({
    where: { id: auctionItemId },
  });
  if (!auction || auction.status === "ENDED") return auction;

  const uniqueBids = await prisma.bid.groupBy({
    by: ["amount"],
    where: { auctionItemId },
    _count: { amount: true },
    having: { amount: { _count: { equals: 1 } } },
    orderBy: { amount: "asc" },
    take: 1,
  });

  let winnerUserId: string | null = null;
  let winningAmount: number | null = null;

  if (uniqueBids.length > 0) {
    winningAmount = uniqueBids[0].amount;
    const winningBid = await prisma.bid.findFirst({
      where: { auctionItemId, amount: winningAmount },
    });
    winnerUserId = winningBid?.userId ?? null;

    if (winnerUserId) {
      await prisma.notificationLog.create({
        data: {
          userId: winnerUserId,
          type: "AUCTION_WON",
          channel: "IN_APP",
          status: "SENT",
          title: "Congratulations!",
          message: `You won the auction: ${auction.title}`,
        },
      });
    }
  }

  return prisma.auctionItem.update({
    where: { id: auctionItemId },
    data: {
      status: "ENDED",
      winnerUserId,
      winningAmount,
      resolvedAt: new Date(),
    },
  });
};

const enrichAuctionList = async (items: any[], userId?: string) => {
  if (!items.length) return [];
  const ids = items.map((i) => i.id);

  const [bidGroups, termsGroups] = await Promise.all([
    prisma.bid.groupBy({
      by: ["auctionItemId"],
      where: { auctionItemId: { in: ids } },
      _count: { _all: true },
    }),
    prisma.auctionTermsAcceptance.groupBy({
      by: ["auctionItemId"],
      where: { auctionItemId: { in: ids } },
      _count: { _all: true },
    }),
  ]);

  const bidMap = new Map(bidGroups.map((g) => [g.auctionItemId, g._count._all]));
  const termsMap = new Map(termsGroups.map((g) => [g.auctionItemId, g._count._all]));

  let userBidSet = new Set<string>();
  if (userId) {
    const userBids = await prisma.bid.findMany({
      where: { userId, auctionItemId: { in: ids } },
      select: { auctionItemId: true },
      distinct: ["auctionItemId"],
    });
    userBidSet = new Set(userBids.map((b) => b.auctionItemId));
  }

  return items.map((item) => ({
    ...item,
    bidCount: bidMap.get(item.id) ?? 0,
    termsAcceptedCount: termsMap.get(item.id) ?? 0,
    userHasBid: userId ? userBidSet.has(item.id) : false,
  }));
};

export const getActiveAuctions = async (userId?: string) => {
  await syncExpiredAuctions();
  const now = new Date();
  const recentEndedSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const items = await prisma.auctionItem.findMany({
    where: {
      OR: [
        { status: "ACTIVE", endTime: { gt: now } },
        { status: "ENDED", endTime: { gte: recentEndedSince } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return enrichAuctionList(items, userId);
};

export const acceptAuctionTerms = async (userId: string, auctionItemId: string) => {
  const auction = await prisma.auctionItem.findUnique({ where: { id: auctionItemId } });
  if (!auction || auction.status !== "ACTIVE") {
    throw new Error("Auction is not active");
  }
  await prisma.auctionTermsAcceptance.upsert({
    where: {
      userId_auctionItemId: { userId, auctionItemId },
    },
    create: { userId, auctionItemId },
    update: {},
  });
  const termsAcceptedCount = await prisma.auctionTermsAcceptance.count({
    where: { auctionItemId },
  });
  return { termsAcceptedCount };
};

export const getAuctionById = async (id: string, incrementView = false) => {
  await syncExpiredAuctions();
  if (incrementView) {
    await prisma.auctionItem.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
  }
  const auction = await prisma.auctionItem.findUnique({ where: { id } });
  if (!auction) return null;
  const [bidCount, termsAcceptedCount] = await Promise.all([
    prisma.bid.count({ where: { auctionItemId: id } }),
    prisma.auctionTermsAcceptance.count({ where: { auctionItemId: id } }),
  ]);
  return { ...auction, bidCount, termsAcceptedCount, serverTime: new Date().toISOString() };
};

export const placeBid = async (
  userId: string,
  auctionItemId: string,
  amount: number,
  servicePaymentId?: string,
) => {
  await syncExpiredAuctions();

  const auction = await prisma.auctionItem.findUnique({ where: { id: auctionItemId } });
  if (!auction || auction.status !== "ACTIVE" || new Date(auction.endTime) < new Date()) {
    throw new Error("Auction is not active or has ended");
  }

  if (amount < auction.minBid || amount > auction.maxBid) {
    throw new Error(`Bid must be between ${auction.minBid} and ${auction.maxBid} ETB`);
  }

  const step = auction.bidStep || 0.01;
  const rounded = Math.round(amount / step) * step;
  if (Math.abs(rounded - amount) > 0.001) {
    throw new Error(`Bid must be in steps of ${step}`);
  }

  let paymentId: string | undefined;
  if (servicePaymentId) {
    const { assertPaidServiceFee } = await import("./chereta.payment.service");
    const payment = await assertPaidServiceFee(userId, auctionItemId, servicePaymentId, rounded);
    paymentId = payment.id;
  } else if (process.env.REQUIRE_BID_SERVICE_FEE !== "false") {
    throw new Error("Service fee payment is required. Initialize Chapa payment first.");
  }

  const bid = await prisma.bid.create({
    data: {
      userId,
      auctionItemId,
      amount: rounded,
      servicePaymentId: paymentId,
    },
  });

  await prisma.notificationLog.create({
    data: {
      userId,
      type: "BID_PLACED",
      channel: "IN_APP",
      status: "SENT",
      title: "Bid placed",
      message: `Your bid of ${rounded} ETB was recorded for ${auction.title}`,
    },
  });

  return bid;
};

function maskPhone(phone?: string | null) {
  if (!phone || phone.length < 6) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return phone;
  return `${digits.slice(0, 4)}****${digits.slice(-2)}`;
}

export const getAuctionResults = async (auctionItemId: string, viewerUserId?: string) => {
  await syncExpiredAuctions();
  const auction = await prisma.auctionItem.findUnique({ where: { id: auctionItemId } });
  if (!auction) throw new Error("Auction not found");

  const bids = await prisma.bid.findMany({
    where: { auctionItemId },
    include: {
      user: { select: { id: true, phoneNumber: true, firstName: true, lastName: true } },
    },
    orderBy: { amount: "asc" },
  });

  const byAmount = new Map<number, typeof bids>();
  for (const b of bids) {
    const list = byAmount.get(b.amount) ?? [];
    list.push(b);
    byAmount.set(b.amount, list);
  }

  const category = auction.categoryLabel || auction.category;
  let winner: {
    phone: string;
    category: string;
    bidAmount: number;
    auctionCode: string;
    userId: string;
  } | null = null;

  if (auction.winnerUserId && auction.winningAmount != null) {
    const winBid = bids.find(
      (b) => b.userId === auction.winnerUserId && b.amount === auction.winningAmount,
    );
    winner = {
      phone: maskPhone(winBid?.user.phoneNumber),
      category,
      bidAmount: auction.winningAmount,
      auctionCode: auction.auctionCode,
      userId: auction.winnerUserId,
    };
  }

  const duplicateLosers: {
    phone: string;
    category: string;
    bidAmount: number;
    auctionCode: string;
    userId: string;
  }[] = [];

  for (const [amount, group] of byAmount) {
    if (group.length < 2) continue;
    for (const b of group) {
      if (winner && b.userId === winner.userId && amount === winner.bidAmount) continue;
      duplicateLosers.push({
        phone: maskPhone(b.user.phoneNumber),
        category,
        bidAmount: amount,
        auctionCode: auction.auctionCode,
        userId: b.userId,
      });
    }
  }

  let viewerStatus: "NO_BID" | "WON" | "LOST_DUPLICATE" | "LOST" = "NO_BID";
  if (viewerUserId) {
    const mine = bids.find((b) => b.userId === viewerUserId);
    if (mine) {
      if (winner?.userId === viewerUserId) viewerStatus = "WON";
      else if (duplicateLosers.some((d) => d.userId === viewerUserId)) viewerStatus = "LOST_DUPLICATE";
      else viewerStatus = "LOST";
    }
  }

  return {
    auction,
    winner,
    duplicateLosers,
    viewerStatus,
    serverTime: new Date().toISOString(),
  };
};

export const getWinners = async () => {
  await syncExpiredAuctions();
  const endedAuctions = await prisma.auctionItem.findMany({
    where: { status: "ENDED" },
    orderBy: { resolvedAt: "desc" },
  });

  const winnersResult = [];

  for (const auct of endedAuctions) {
    if (auct.winnerUserId && auct.winningAmount != null) {
      const user = await prisma.user.findUnique({ where: { id: auct.winnerUserId } });
      const bidCount = await prisma.bid.count({ where: { auctionItemId: auct.id } });
      winnersResult.push({
        auction: auct,
        bidCount,
        winner: user
          ? {
              name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.phoneNumber || "Winner",
              phone: user.phoneNumber || "",
              amount: auct.winningAmount,
              address: user.address,
            }
          : null,
      });
    } else {
      winnersResult.push({
        auction: auct,
        bidCount: await prisma.bid.count({ where: { auctionItemId: auct.id } }),
        winner: null,
      });
    }
  }
  return winnersResult;
};

export const getBidHistory = async (auctionItemId: string) => {
  return prisma.bid.findMany({
    where: { auctionItemId },
    include: { user: true },
    orderBy: { amount: "asc" },
  });
};

export const getUserBids = async (userId: string) => {
  await syncExpiredAuctions();
  const bids = await prisma.bid.findMany({
    where: { userId },
    include: {
      auctionItem: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return bids;
};

export const createAuction = async (data: any) => {
  const { allocateNextAuctionCode } = await import("../../lib/auctionCode");
  const code = data.auctionCode ?? (await allocateNextAuctionCode());
  return prisma.auctionItem.create({
    data: {
      auctionCode: code,
      title: data.title,
      category: data.category as AuctionCategory,
      categoryLabel: data.categoryLabel,
      itemNumber: data.itemNumber,
      specs: data.specs,
      images: data.images || [],
      serviceFee: data.serviceFee ?? 75,
      minBid: data.minBid ?? 1.01,
      maxBid: data.maxBid ?? 999.99,
      bidStep: data.bidStep ?? 0.01,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      status: (data.status as AuctionStatus) || "ACTIVE",
    },
  });
};

export const updateAuction = async (id: string, data: any) => {
  const payload: any = {};
  if (data.title != null) payload.title = data.title;
  if (data.category != null) payload.category = data.category;
  if (data.categoryLabel != null) payload.categoryLabel = data.categoryLabel;
  if (data.itemNumber != null) payload.itemNumber = data.itemNumber;
  if (data.specs != null) payload.specs = data.specs;
  if (data.images != null) payload.images = data.images;
  if (data.serviceFee != null) payload.serviceFee = Number(data.serviceFee);
  if (data.minBid != null) payload.minBid = Number(data.minBid);
  if (data.maxBid != null) payload.maxBid = Number(data.maxBid);
  if (data.bidStep != null) payload.bidStep = Number(data.bidStep);
  if (data.startTime != null) payload.startTime = new Date(data.startTime);
  if (data.endTime != null) payload.endTime = new Date(data.endTime);
  if (data.status != null) payload.status = data.status;

  return prisma.auctionItem.update({
    where: { id },
    data: payload,
  });
};
