import { create } from "zustand";
import { getEqubById, getMyEqubs } from "@/api/equbSevice";

interface EqubMemberState {
  equb: any | null;
  joinedEqubs: any[];
  fetching: boolean;
  error: string | null;
  loadEqub: (equbId: string) => Promise<void>;
  loadAllJoinedMembers: () => Promise<void>;
}

export const useEqubMemberStore = create<EqubMemberState>((set) => ({
  equb: null,
  joinedEqubs: [],
  fetching: false,
  error: null,

  loadEqub: async (equbId: string) => {
    set({ fetching: true, error: null });
    try {
      const data = await getEqubById(equbId);
      set({ equb: data, fetching: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch equb", fetching: false });
    }
  },

  loadAllJoinedMembers: async () => {
    set({ fetching: true, error: null });
    try {
      const data = await getMyEqubs();
      set({ joinedEqubs: data, fetching: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch joined members", fetching: false });
    }
  },
}));
