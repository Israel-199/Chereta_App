import { create } from "zustand";
import { getSofaEqubs, joinEqub } from "../api/equbSevice";
import { useAuthStore } from "./auth";

interface SofaEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadSofaEqubs: (forceSkeleton?: boolean) => Promise<void>;
  joinSofaEqub: (equbId: string) => Promise<any>;
}

export const useSofaEqubStore = create<SofaEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,

  loadSofaEqubs: async (forceSkeleton = false) => {
    const hasCache = useSofaEqubStore.getState().equbs.length > 0;
    if (!hasCache || forceSkeleton) set({ fetching: true });
    set({ error: null });
    try {
      const data = await getSofaEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch sofa equbs",
        fetching: false,
      });
    }
  },

  joinSofaEqub: async (equbId: string) => {
    try {
      const res = await joinEqub(equbId);

      const data = await getSofaEqubs();
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
