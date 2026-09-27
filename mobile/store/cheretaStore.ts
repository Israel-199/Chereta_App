import { create } from "zustand";

type State = {
  myBidsVersion: number;
  bumpMyBids: () => void;
};

export const useCheretaStore = create<State>((set) => ({
  myBidsVersion: 0,
  bumpMyBids: () => set((s) => ({ myBidsVersion: s.myBidsVersion + 1 })),
}));
