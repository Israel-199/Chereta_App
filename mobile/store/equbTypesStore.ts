import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAvailableEqubTypes } from "../api/equbSevice";

interface EqubTypesState {
  availableTypes: string[];
  fetching: boolean;
  error: string | null;
  loadAvailableTypes: () => Promise<void>;
}

export const useEqubTypesStore = create<EqubTypesState>()(
  persist(
    (set) => ({
      availableTypes: [],
      fetching: false,
      error: null,

      loadAvailableTypes: async () => {
        set({ fetching: true, error: null });
        try {
          const types = await getAvailableEqubTypes();
          set({ availableTypes: types, fetching: false });
        } catch (err: any) {
          set({ error: err.message || "Failed to fetch equb types", fetching: false });
        }
      },
    }),
    {
      name: "equb-types-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ availableTypes: state.availableTypes }),
    }
  )
);
