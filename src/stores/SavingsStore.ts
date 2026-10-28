import { create } from "zustand";
import { Saving, SavingsHistoryEntry } from "@/src/interfaces/schema";

interface SavingsState {
  saving: Saving | null;
  setSaving: (saving: Saving | null) => void;
  savings: Saving[] | null;
  setSavings: (savings: Saving[]) => void;
  savingsHistory: SavingsHistoryEntry[] | null;
  setSavingsHistory: (savingsHistory: SavingsHistoryEntry[]) => void;
}

const useSavingsStore = create<SavingsState>()((set) => ({
  saving: null,
  savings: null,
  savingsHistory: null,
  setSaving: async (saving) => {
    set(() => ({
      saving,
    }));
  },
  setSavings: async (savings) => {
    set(() => ({
      savings,
    }));
  },
  setSavingsHistory: async (savingsHistory) => {
    set(() => ({
      savingsHistory,
    }));
  },
}));

export default useSavingsStore;
