import { create } from "zustand";
import { getVehicleEqubs, joinEqub } from "../api/equbSevice";
import { useAuthStore } from "./auth";

interface VehicleEqubState {
  equbs: any[];
  fetching: boolean;
  error: string | null;
  loadVehicleEqubs: () => Promise<void>;
  joinVehicleEqub: (equbId: string) => Promise<any>;
}

export const useVehicleEqubStore = create<VehicleEqubState>((set) => ({
  equbs: [],
  fetching: false,
  error: null,

  loadVehicleEqubs: async () => {
    set({ fetching: true, error: null });
    try {
      const data = await getVehicleEqubs();
      set({ equbs: data, fetching: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch vehicle equbs",
        fetching: false,
      });
    }
  },

  joinVehicleEqub: async (equbId: string) => {
    try {
      const res = await joinEqub(equbId);

      const data = await getVehicleEqubs();
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
