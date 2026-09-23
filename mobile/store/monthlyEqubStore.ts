import { create } from "zustand";
import { getMonthlyEqubs, joinEqub } from "../api/equbSevice";
import { useAuthStore } from "./auth";

interface MonthlyEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadMonthlyEqubs: () => Promise<void>;
  joinMonthlyEqub: (equbId: string) => Promise<any>;
}

export const useMonthlyEqubStore = create<MonthlyEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,

  loadMonthlyEqubs: async () => {
    set({ fetching: true, error: null });
    try {
      const data = await getMonthlyEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch monthly equbs",
        fetching: false,
      });
    }
  },

  joinMonthlyEqub: async (equbId: string) => {
    try {
      const res = await joinEqub(equbId);

      const data = await getMonthlyEqubs();
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
