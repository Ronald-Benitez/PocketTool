import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export const RECORD_DEFAULTS_KEY = 'recordDefaults';

export type RecordDefaultValues = {
  lastTypeId: number | null;
  lastCategoryId: number | null;
  lastPaymentMethodId: number | null;
  lastToPayMethodId: number | null;
};

type RecordDefaultsState = RecordDefaultValues & {
  loaded: boolean;
  load: (force?: boolean) => Promise<void>;
  reload: () => Promise<void>;
  remember: (values: Partial<RecordDefaultValues>) => Promise<void>;
  reset: () => Promise<void>;
};

const EMPTY: RecordDefaultValues = {
  lastTypeId: null,
  lastCategoryId: null,
  lastPaymentMethodId: null,
  lastToPayMethodId: null,
};

const isId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const normalize = (value: unknown): RecordDefaultValues => {
  if (!value || typeof value !== 'object') return { ...EMPTY };
  const parsed = value as Partial<RecordDefaultValues>;
  return {
    lastTypeId: isId(parsed.lastTypeId) ? parsed.lastTypeId : null,
    lastCategoryId: isId(parsed.lastCategoryId) ? parsed.lastCategoryId : null,
    lastPaymentMethodId: isId(parsed.lastPaymentMethodId)
      ? parsed.lastPaymentMethodId
      : null,
    lastToPayMethodId: isId(parsed.lastToPayMethodId)
      ? parsed.lastToPayMethodId
      : null,
  };
};

export const useRecordDefaults = create<RecordDefaultsState>((set, get) => ({
  ...EMPTY,
  loaded: false,

  load: async (force = false) => {
    if (!force && get().loaded) return;
    try {
      const raw = await AsyncStorage.getItem(RECORD_DEFAULTS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      set({ ...normalize(parsed), loaded: true });
    } catch {
      set({ ...EMPTY, loaded: true });
    }
  },

  reload: () => get().load(true),

  remember: async (values) => {
    const next = normalize({ ...get(), ...values });
    set({ ...next, loaded: true });
    try {
      await AsyncStorage.setItem(RECORD_DEFAULTS_KEY, JSON.stringify(next));
    } catch (error) {
      if (__DEV__) console.warn('[records] defaults persist failed', error);
    }
  },

  reset: async () => {
    set({ ...EMPTY, loaded: true });
    try {
      await AsyncStorage.removeItem(RECORD_DEFAULTS_KEY);
    } catch (error) {
      if (__DEV__) console.warn('[records] defaults reset failed', error);
    }
  },
}));
