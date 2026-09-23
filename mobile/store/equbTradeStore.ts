import { create } from "zustand";
import { getEqubListings, getMyListings, createEqubListing, buyEqubListing, cancelEqubListing } from "../api/equbSevice";

interface EqubTradeState {
  listings: any[];
  myListings: any[];
  fetching: boolean;
  fetchingMyListings: boolean;
  error: string | null;
  loadListings: (equbId: string) => Promise<void>;
  loadAllListings: (equbIds: string[]) => Promise<void>;
  loadMyListings: () => Promise<void>;
  createListing: (equbId: string, sellingPrice: number) => Promise<void>;
  buyListing: (equbId: string, listingId: string) => Promise<void>;
  cancelListing: (equbId: string, listingId: string) => Promise<void>;
}

export const useEqubTradeStore = create<EqubTradeState>((set) => ({
  listings: [],
  myListings: [],
  fetching: false,
  fetchingMyListings: false,
  error: null,

  loadListings: async (equbId: string) => {
    set({ fetching: true, error: null });
    try {
      const data = await getEqubListings(equbId);
      set({ listings: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to load listings",
        fetching: false,
      });
      throw err;
    }
  },

  loadAllListings: async (equbIds: string[]) => {
    set({ fetching: true, error: null });
    try {
      const promises = equbIds.map(id => getEqubListings(id).catch(() => []));
      const results = await Promise.all(promises);
      const allListings = results.flat();
      set({ listings: allListings, fetching: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to load listings",
        fetching: false,
      });
      throw err;
    }
  },

  loadMyListings: async () => {
    set({ fetchingMyListings: true, error: null });
    try {
      const data = await getMyListings();
      set({ myListings: data, fetchingMyListings: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to load your listings",
        fetchingMyListings: false,
      });
      throw err;
    }
  },

  createListing: async (equbId: string, sellingPrice: number) => {
    try {
      await createEqubListing(equbId, sellingPrice);
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || "Failed to create listing" });
      throw err;
    }
  },

  buyListing: async (equbId: string, listingId: string) => {
    try {
      await buyEqubListing(equbId, listingId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || "Failed to buy listing" });
      throw err;
    }
  },

  cancelListing: async (equbId: string, listingId: string) => {
    try {
      await cancelEqubListing(equbId, listingId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || "Failed to cancel listing" });
      throw err;
    }
  },
}));
