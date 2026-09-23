import { create } from "zustand";
import { getPhoneEqubs, joinEqub } from "../api/equbSevice";
import { useAuthStore } from "./auth";

interface PhoneEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadPhoneEqubs: (forceSkeleton?: boolean) => Promise<void>;
  joinPhoneEqub: (equbId: string) => Promise<any>;
}

export const usePhoneEqubStore = create<PhoneEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,

  loadPhoneEqubs: async (forceSkeleton = false) => {
    const hasCache = usePhoneEqubStore.getState().equbs.length > 0;
    if (!hasCache || forceSkeleton) set({ fetching: true });
    set({ error: null });
    try {
      const data = await getPhoneEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch phone equbs",
        fetching: false,
      });
    }
  },

  joinPhoneEqub: async (equbId: string) => {
    try {
      const res = await joinEqub(equbId);

      const data = await getPhoneEqubs();
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
