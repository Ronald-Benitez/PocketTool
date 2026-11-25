import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  createDefaultDashboardLayout,
  moveDashboardBlock,
  normalizeDashboardLayout,
  setDashboardBlockVisibility,
  setDashboardQuickActions,
} from './layout';
import type {
  DashboardActionId,
  DashboardBlockId,
  DashboardLayout,
} from './types';

export const DASHBOARD_STORAGE_KEY = 'dashboardLayout';

type DashboardLayoutState = DashboardLayout & {
  loaded: boolean;
  load: (force?: boolean) => Promise<void>;
  reload: () => Promise<void>;
  moveBlock: (from: number, to: number) => Promise<void>;
  setVisibility: (id: DashboardBlockId, visible: boolean) => Promise<void>;
  setQuickActions: (actions: DashboardActionId[]) => Promise<void>;
  reset: () => Promise<void>;
};

const snapshot = (state: DashboardLayoutState): DashboardLayout => ({
  version: state.version,
  blocks: state.blocks,
  quickActions: state.quickActions,
});

let initializing: Promise<void> | null = null;

export const useDashboardLayout = create<DashboardLayoutState>((set, get) => {
  const persist = (layout: DashboardLayout) =>
    AsyncStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(layout));

  const commit = async (next: DashboardLayout) => {
    const previous = snapshot(get());
    set(next);
    try {
      await persist(next);
    } catch (error) {
      set(previous);
      throw error;
    }
  };

  return {
    ...createDefaultDashboardLayout(),
    loaded: false,

    load: async (force = false) => {
      if (!force && get().loaded) return;
      if (!force && initializing) return initializing;

      initializing = (async () => {
        try {
          const raw = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : null;
          set({ ...normalizeDashboardLayout(parsed), loaded: true });
        } catch (error) {
          if (__DEV__) console.warn('[dashboard] load failed', error);
          set({ ...createDefaultDashboardLayout(), loaded: true });
        } finally {
          initializing = null;
        }
      })();

      return initializing;
    },

    reload: () => get().load(true),

    moveBlock: async (from, to) => {
      const current = snapshot(get());
      const next = moveDashboardBlock(current, from, to);
      if (next === current) return;
      await commit(next);
    },

    setVisibility: async (id, visible) => {
      const current = snapshot(get());
      const next = setDashboardBlockVisibility(current, id, visible);
      if (next === current) return;
      await commit(next);
    },

    setQuickActions: async (actions) => {
      const current = snapshot(get());
      const next = setDashboardQuickActions(current, actions);
      if (next === current) return;
      await commit(next);
    },

    reset: async () => {
      await commit(createDefaultDashboardLayout());
    },
  };
});
