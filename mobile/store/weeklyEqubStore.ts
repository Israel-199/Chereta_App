import { create } from "zustand";
import { getWeeklyEqubs, joinEqub } from "../api/equbSevice";
import { useAuthStore } from "./auth";

interface WeeklyEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadWeeklyEqubs: () => Promise<void>;
  joinWeeklyEqub: (equbId: string) => Promise<any>;
}

export const useWeeklyEqubStore = create<WeeklyEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,

  loadWeeklyEqubs: async () => {
    set({ fetching: true, error: null });
    try {
      const data = await getWeeklyEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch weekly equbs",
        fetching: false,
      });
    }
  },

  joinWeeklyEqub: async (equbId: string) => {
    try {
      const res = await joinEqub(equbId);
      const data = await getWeeklyEqubs();
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
