// src/lib/zustand.ts
import { create } from "zustand";

type Trader = string | null;

interface QuestStore {
  /** The user’s PMC level (default to 1) */
  level: number;
  /** Currently selected trader to filter by, or null for “all traders” */
  traderFilter: Trader;

  /** Set a new PMC level */
  setLevel: (level: number) => void;
  /** Set or clear the trader filter */
  setTraderFilter: (trader: Trader) => void;
}

export const useQuestStore = create<QuestStore>((set) => ({
  level: 1,
  traderFilter: null,
  setLevel: (level) => set({ level }),
  setTraderFilter: (traderFilter) => set({ traderFilter }),
}));
