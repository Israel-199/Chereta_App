import { create } from "zustand";
import { getHouseEqubs, joinEqub } from "../api/equbSevice";
import { useAuthStore } from "./auth";

interface HouseEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadHouseEqubs: () => Promise<void>;
  joinHouseEqub: (equbId: string) => Promise<any>;
}

export const useHouseEqubStore = create<HouseEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,

  loadHouseEqubs: async () => {
    set({ fetching: true, error: null });
    try {
      const data = await getHouseEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch house equbs",
        fetching: false,
      });
    }
  },

  joinHouseEqub: async (equbId: string) => {
    try {
      const res = await joinEqub(equbId);

      const data = await getHouseEqubs();
      set({ equbs: data });

      await useAuthStore.getState().preloadData();

      return res;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to join equb";
      set({ error: message });
      throw new Error(message);
    }
  },
}));
