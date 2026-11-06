import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type SummaryMode = 'own' | 'total' | 'shared';

const STORAGE_KEY = 'summaryMode';

type SummaryModeStore = {
  mode: SummaryMode;
  loaded: boolean;
  setMode: (mode: SummaryMode) => void;
  load: () => Promise<void>;
};

const isSummaryMode = (value: unknown): value is SummaryMode =>
  value === 'own' || value === 'total' || value === 'shared';

export const useSummaryMode = create<SummaryModeStore>((set) => ({
  mode: 'own',
  loaded: false,
  setMode: (mode) => {
    set({ mode });
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {
      // Preferences are optional.
    });
  },
  load: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (isSummaryMode(stored)) set({ mode: stored });
    } catch {
      // Keep the default mode.
    } finally {
      set({ loaded: true });
    }
  },
}));

export const pickSummaryAmount = (
  mode: SummaryMode,
  buckets: { own: number; shared: number; total: number }
) => {
  if (mode === 'total') return buckets.total;
  if (mode === 'shared') return buckets.shared;
  return buckets.own;
};
