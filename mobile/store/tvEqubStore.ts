import { create } from "zustand";
import { getTvEqubs, joinEqub } from "../api/equbSevice";
import { useAuthStore } from "./auth";

interface TvEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadTvEqubs: (forceSkeleton?: boolean) => Promise<void>;
  joinTvEqub: (equbId: string) => Promise<any>;
}

export const useTvEqubStore = create<TvEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,

  loadTvEqubs: async (forceSkeleton = false) => {
    const hasCache = useTvEqubStore.getState().equbs.length > 0;
    if (!hasCache || forceSkeleton) set({ fetching: true });
    set({ error: null });
    try {
      const data = await getTvEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch TV equbs",
        fetching: false,
      });
    }
  },

  joinTvEqub: async (equbId: string) => {
    try {
      const res = await joinEqub(equbId);

      const data = await getTvEqubs();
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
