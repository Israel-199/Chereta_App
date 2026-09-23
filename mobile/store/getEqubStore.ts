import { create } from "zustand";
import { getMyEqubs } from "../api/equbSevice";

interface MyEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadMyEqubs: () => Promise<void>;
}

export const useMyEqubStore = create<MyEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,
  loadMyEqubs: async () => {
    set({ fetching: true, error: null });
    try {
      const data = await getMyEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch user equbs",
        fetching: false,
      });
    }
  },
}));
