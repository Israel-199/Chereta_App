import { create } from "zustand";
import { AuctionItem, fetchActiveAuctions, fetchWinners, fetchMyBids } from "../api/chereta";

type State = {
  auctions: AuctionItem[];
  serverOffset: number;
  winners: any[];
  myBids: any[];
  auctionsReady: boolean;
  winnersReady: boolean;
  refreshAuctions: () => Promise<AuctionItem[]>;
  refreshWinners: () => Promise<any[]>;
  refreshMyBids: (token: string | null) => Promise<any[]>;
  prefetchTabs: (token?: string | null) => void;
};

export const useCheretaCache = create<State>((set, get) => ({
  auctions: [],
  serverOffset: 0,
  winners: [],
  myBids: [],
  auctionsReady: false,
  winnersReady: false,

  refreshAuctions: async () => {
    try {
      const { auctions: list, serverTime } = await fetchActiveAuctions();
      const auctions = Array.isArray(list) ? list : [];
      set({
        auctions,
        serverOffset: new Date(serverTime).getTime() - Date.now(),
        auctionsReady: true,
      });
      void get().refreshWinners();
      return auctions;
    } catch {
      set({ auctionsReady: true });
      return get().auctions;
    }
  },

  refreshWinners: async () => {
    try {
      const { winners: list } = await fetchWinners();
      const winners = (list ?? []).filter(
        (w) => w?.winner != null || w?.auction?.winningAmount != null,
      );
      set({ winners, winnersReady: true });
      return winners;
    } catch {
      set({ winnersReady: true });
      return get().winners;
    }
  },

  refreshMyBids: async (token) => {
    if (!token) {
      set({ myBids: [] });
      return [];
    }
    try {
      const data = await fetchMyBids();
      set({ myBids: data });
      return data;
    } catch {
      return get().myBids;
    }
  },

  prefetchTabs: (token) => {
    void get().refreshAuctions();
    void get().refreshWinners();
    if (token) void get().refreshMyBids(token);
  },
}));
