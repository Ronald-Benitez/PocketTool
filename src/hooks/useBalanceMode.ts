import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type BalanceMode = 'consumption' | 'cash';

const STORAGE_KEY = 'balanceMode';

type BalanceModeStore = {
  mode: BalanceMode;
  loaded: boolean;
  setMode: (mode: BalanceMode) => void;
  load: () => Promise<void>;
};

const isBalanceMode = (value: unknown): value is BalanceMode =>
  value === 'consumption' || value === 'cash';

export const useBalanceMode = create<BalanceModeStore>((set) => ({
  mode: 'consumption',
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
      if (isBalanceMode(stored)) set({ mode: stored });
    } catch {
      // Keep the default mode.
    } finally {
      set({ loaded: true });
    }
  },
}));
