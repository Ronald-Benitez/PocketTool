import { create } from "zustand";
import { Savings, SavingsHistory } from "../interfaces";

interface SavingsState {
  saving: Savings | null;
  setSaving: (saving: Savings | null) => void;
  savings: Savings[] | null;
  setSavings: (savings: Savings[] ) => void;
  savingsHistory: SavingsHistory[] | null;
  setSavingsHistory: (savingsHistory: SavingsHistory[]) => void
}

const useSavingsStore = create<SavingsState>()((set) => ({
  saving: null,
  savings: null,
  savingsHistory: null,
  setSaving: async (saving) => {
    set(() => ({
      saving
    }));
  },
  setSavings: async (savings) => {
    set(() => ({
      savings
    }));
  },
  setSavingsHistory: async (savingsHistory) => {
    set(() => ({
        savingsHistory
    }));
  },
}));

export default useSavingsStore;
