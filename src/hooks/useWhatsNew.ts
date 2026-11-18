import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { create } from 'zustand';

import {
  RELEASE_NOTES,
  RELEASE_NOTES_LAUNCH_EXCEPTION_VERSION,
  type ReleaseNote,
} from '@/src/release-notes/catalog';
import { selectPendingReleaseNotes } from '@/src/release-notes/versions';

export const WHATS_NEW_LAST_SEEN_KEY = 'whatsNewLastSeenVersion';

export type WhatsNewMode = 'auto' | 'manual';

type WhatsNewState = {
  ready: boolean;
  visible: boolean;
  mode: WhatsNewMode | null;
  pending: ReleaseNote[];
  initialize: () => Promise<void>;
  openManual: () => void;
  close: () => Promise<void>;
};

const getCurrentVersion = () => Constants.expoConfig?.version ?? null;

let initializing: Promise<void> | null = null;

export const useWhatsNew = create<WhatsNewState>((set, get) => ({
  ready: false,
  visible: false,
  mode: null,
  pending: [],

  initialize: async () => {
    if (get().ready) return;
    if (initializing) return initializing;

    initializing = (async () => {
      const currentVersion = getCurrentVersion();

      if (!currentVersion) {
        set({ ready: true });
        return;
      }

      try {
        const lastSeenVersion = await AsyncStorage.getItem(
          WHATS_NEW_LAST_SEEN_KEY
        );
        const pending = selectPendingReleaseNotes(
          RELEASE_NOTES,
          currentVersion,
          lastSeenVersion,
          { launchExceptionVersion: RELEASE_NOTES_LAUNCH_EXCEPTION_VERSION }
        );

        if (pending.length === 0) {
          await AsyncStorage.setItem(WHATS_NEW_LAST_SEEN_KEY, currentVersion);
        }

        set({
          ready: true,
          pending,
          visible: pending.length > 0,
          mode: pending.length > 0 ? 'auto' : null,
        });
      } catch {
        set({ ready: true });
      } finally {
        initializing = null;
      }
    })();

    return initializing;
  },

  openManual: () => set({ visible: true, mode: 'manual' }),

  close: async () => {
    const { mode } = get();
    set({ visible: false, pending: [], mode: null });

    if (mode !== 'auto') return;

    const currentVersion = getCurrentVersion();
    if (!currentVersion) return;

    try {
      await AsyncStorage.setItem(WHATS_NEW_LAST_SEEN_KEY, currentVersion);
    } catch {
      // The summary opens again on the next launch if storing fails.
    }
  },
}));
