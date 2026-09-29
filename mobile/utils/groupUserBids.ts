export type UserBidRecord = {
  id: string;
  amount: number;
  createdAt: string;
  auctionItem?: {
    id: string;
    title: string;
    category: string;
    categoryLabel?: string;
    images?: string[];
    auctionCode?: string;
    status?: string;
    winnerUserId?: string | null;
    winningAmount?: number | null;
  };
};

export function groupBidsByAuction(bids: UserBidRecord[]) {
  const map = new Map<string, { auction: NonNullable<UserBidRecord["auctionItem"]>; bids: UserBidRecord[] }>();
  for (const b of bids) {
    const a = b.auctionItem;
    if (!a?.id) continue;
    if (!map.has(a.id)) map.set(a.id, { auction: a, bids: [] });
    map.get(a.id)!.bids.push(b);
  }
  return Array.from(map.values()).map((g) => ({
    ...g,
    bids: [...g.bids].sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()),
  }));
}

export function filterUserWins(bids: UserBidRecord[], userId?: string | null) {
  if (!userId) return [];
  return groupBidsByAuction(bids).filter((g) => g.auction.winnerUserId === userId);
}
