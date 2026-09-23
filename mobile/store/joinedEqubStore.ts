import { create } from "zustand";
import { getMyEqubs, leaveEqub } from "../api/equbSevice";

interface JoinedEqubState {
  joinedEqubs: any[];
  fetching: boolean;
  hasLoaded: boolean;
  error: string | null;
  loadJoinedEqubs: () => Promise<void>;
  leaveEqub: (equbId: string) => Promise<void>;
}

export const useJoinedEqubStore = create<JoinedEqubState>((set) => ({
  joinedEqubs: [],
  fetching: false,
  hasLoaded: false,
  error: null,

  loadJoinedEqubs: async () => {
    set({ fetching: true, error: null });
    try {
      const data = await getMyEqubs();
      set({ joinedEqubs: data, fetching: false, hasLoaded: true });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch joined equbs",
        fetching: false,
      });
    }
  },

  leaveEqub: async (equbId: string) => {
    try {
      await leaveEqub(equbId);
      const data = await getMyEqubs();
      set({ joinedEqubs: data, hasLoaded: true });
    } catch (err: any) {
      set({ error: err.message || "Failed to leave equb" });
      throw err;
    }
  },
}));
