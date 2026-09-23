import { create } from "zustand";
import { getRefrigeratorEqubs, joinEqub } from "../api/equbSevice";
import { useAuthStore } from "./auth";

interface RefrigeratorEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadRefrigeratorEqubs: (forceSkeleton?: boolean) => Promise<void>;
  joinRefrigeratorEqub: (equbId: string) => Promise<any>;
}

export const useRefrigeratorEqubStore = create<RefrigeratorEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,

  loadRefrigeratorEqubs: async (forceSkeleton = false) => {
    const hasCache = useRefrigeratorEqubStore.getState().equbs.length > 0;
    if (!hasCache || forceSkeleton) set({ fetching: true });
    set({ error: null });
    try {
      const data = await getRefrigeratorEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch refrigerator equbs",
        fetching: false,
      });
    }
  },

  joinRefrigeratorEqub: async (equbId: string) => {
    try {
      const res = await joinEqub(equbId);

      const data = await getRefrigeratorEqubs();
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
