// File: lib/zustand.ts
import { create } from "zustand";

export interface Quest {
  id: string;
  name: string;
  level: number;
  trader: string;
  requirements: { id: string }[];
  traderRequirements: { id: string }[]; // ✅ ADD THIS LINE
  kappaRequired: boolean;
  objectives: {
    id: string;
    type: string;
    description: string;
    count?: number;
    maps: { id: string; name: string }[];
    itemCount?: number;
    itemName?: string;
    iconUrl?: string;
  }[];
}

interface QuestStore {
  // PMC level
  level: number;
  setLevel: (n: number) => void;

  // Trader filter
  traderFilter: string | null;
  setTraderFilter: (t: string | null) => void;

  // All quests loaded from API
  allQuests: Quest[];
  setAllQuests: (qs: Quest[]) => void;
}

export const useQuestStore = create<QuestStore>((set) => ({
  level: 1,
  setLevel: (n) => set({ level: n }),

  traderFilter: null,
  setTraderFilter: (t) => set({ traderFilter: t }),

  allQuests: [],
  setAllQuests: (qs) => set({ allQuests: qs }),
}));
