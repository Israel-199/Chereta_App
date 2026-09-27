import { create } from "zustand";
import { getAppStatus } from "@/api/config";

interface State {
  appLive: boolean | null;
  status: string | null;
  launchDate: string | null;
  serverTime: string | null;
  loading: boolean;
  loadConfig: () => Promise<void>;
}

export const useAppConfigStore = create<State>((set) => ({
  appLive: null,
  status: null,
  launchDate: null,
  serverTime: null,
  loading: true,

  loadConfig: async () => {
    try {
      const res = await getAppStatus();
      const data = (res as { data?: typeof res }).data ?? res;

      set({
        appLive: data.appLive,
        status: data.status,
        launchDate: data.release?.utcDate,
        serverTime: data.serverTime,
        loading: false,
      });
    } catch (error) {
      console.log("Config load failed", error);
      set({ loading: false });
    }
  },
}));
