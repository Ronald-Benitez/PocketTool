import { create } from 'zustand';
import { Saving, SavingsHistoryEntry } from '@/src/interfaces/schema';

interface SavingsState {
  saving: Saving | null;
  setSaving: (saving: Saving | null) => void;
  savings: Saving[];
  setSavings: (savings: Saving[]) => void;
  savingsHistory: SavingsHistoryEntry[];
  setSavingsHistory: (savingsHistory: SavingsHistoryEntry[]) => void;
}

const useSavingsStore = create<SavingsState>()((set) => ({
  saving: null,
  savings: [],
  savingsHistory: [],
  setSaving: (saving) => set({ saving }),
  setSavings: (savings) => set({ savings }),
  setSavingsHistory: (savingsHistory) => set({ savingsHistory }),
}));

export default useSavingsStore;
