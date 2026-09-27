import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface EqubTypesState {
  availableTypes: string[];
  fetching: boolean;
  error: string | null;
  loadAvailableTypes: () => Promise<void>;
}

/** Legacy store kept for compatibility — Chereta app no longer uses Equb types. */
export const useEqubTypesStore = create<EqubTypesState>()(
  persist(
    (set) => ({
      availableTypes: [],
      fetching: false,
      error: null,

      loadAvailableTypes: async () => {
        set({ availableTypes: [], fetching: false, error: null });
      },
    }),
    {
      name: "equb-types-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ availableTypes: state.availableTypes }),
    },
  ),
);
