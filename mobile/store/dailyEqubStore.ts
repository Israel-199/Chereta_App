import { create } from "zustand";
import { getDailyEqubs, joinEqub } from "../api/equbSevice";

interface DailyEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadDailyEqubs: () => Promise<void>;
  joinEqubAction: (equbId: string) => Promise<void>;
}

export const useDailyEqubStore = create<DailyEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,

  loadDailyEqubs: async () => {
    set({ fetching: true, error: null });
    try {
      const data = await getDailyEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({ error: err.message, fetching: false });
    }
  },

  joinEqubAction: async (equbId: string) => {
    try {
      await joinEqub(equbId);
      const data = await getDailyEqubs();
      set({ equbs: data });
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to join equb";
      set({ error: message });
      throw new Error(message);
    }
  },
}));
