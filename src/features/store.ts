import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { FEATURE_IDS } from './definitions';
import {
  applyPreset as resolvePreset,
  disableFeature,
  matchPreset,
  normalizeFeatures,
} from './normalize';
import type {
  ExperiencePresetId,
  ExperiencePresetSelection,
  FeatureAdjustment,
  FeatureId,
} from './types';

export const EXPERIENCE_STORAGE_KEY = 'experienceSettings';
export const EXPERIENCE_ONBOARDED_KEY = 'experienceOnboardedVersion';
export const EXPERIENCE_ONBOARDED_VERSION = '1';

const DEFAULT_PRESET: ExperiencePresetId = 'complete';

const defaultEnabled = resolvePreset(DEFAULT_PRESET).enabled;

const presetIds: ExperiencePresetSelection[] = [
  'essential',
  'balanced',
  'complete',
  'custom',
];

const isPresetSelection = (
  value: unknown
): value is ExperiencePresetSelection =>
  typeof value === 'string' && presetIds.includes(value as ExperiencePresetSelection);

type StoredExperience = {
  version?: unknown;
  presetId?: unknown;
  enabled?: unknown;
};

const parseStored = (
  raw: string | null
): { presetId: ExperiencePresetSelection; enabled: Record<FeatureId, boolean> } | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredExperience;
    if (parsed.version !== 1 || !isPresetSelection(parsed.presetId)) {
      return null;
    }

    const enabled = { ...defaultEnabled };
    if (parsed.enabled && typeof parsed.enabled === 'object') {
      const stored = parsed.enabled as Record<string, unknown>;
      for (const id of FEATURE_IDS) {
        if (typeof stored[id] === 'boolean') {
          enabled[id] = stored[id] as boolean;
        }
      }
    }

    const normalized = normalizeFeatures(enabled);
    return {
      presetId: matchPreset(normalized.enabled),
      enabled: normalized.enabled,
    };
  } catch {
    return null;
  }
};

const persist = async (
  presetId: ExperiencePresetSelection,
  enabled: Record<FeatureId, boolean>
) => {
  try {
    await AsyncStorage.setItem(
      EXPERIENCE_STORAGE_KEY,
      JSON.stringify({ version: 1, presetId, enabled })
    );
  } catch (error) {
    if (__DEV__) console.warn('[features] persist failed', error);
  }
};

interface ExperienceStore {
  ready: boolean;
  presetId: ExperiencePresetSelection;
  enabled: Record<FeatureId, boolean>;
  load: (force?: boolean) => Promise<void>;
  reload: () => Promise<void>;
  applyPreset: (presetId: ExperiencePresetId) => Promise<FeatureAdjustment[]>;
  setFeature: (
    id: FeatureId,
    value: boolean
  ) => Promise<FeatureAdjustment[]>;
  reset: () => Promise<void>;
  isEnabled: (id: FeatureId) => boolean;
}

let initializing: Promise<void> | null = null;

export const useFeatures = create<ExperienceStore>((set, get) => ({
  ready: false,
  presetId: DEFAULT_PRESET,
  enabled: defaultEnabled,

  load: async (force = false) => {
    if (!force && get().ready) return;
    if (!force && initializing) return initializing;

    initializing = (async () => {
      try {
        const raw = await AsyncStorage.getItem(EXPERIENCE_STORAGE_KEY);
        const parsed = parseStored(raw);
        if (parsed) {
          set({
            ready: true,
            presetId: parsed.presetId,
            enabled: parsed.enabled,
          });
        } else {
          set({
            ready: true,
            presetId: DEFAULT_PRESET,
            enabled: defaultEnabled,
          });
        }
      } catch (error) {
        if (__DEV__) console.warn('[features] load failed', error);
        set({
          ready: true,
          presetId: DEFAULT_PRESET,
          enabled: defaultEnabled,
        });
      } finally {
        initializing = null;
      }
    })();

    return initializing;
  },

  reload: () => get().load(true),

  applyPreset: async (presetId) => {
    const resolved = resolvePreset(presetId);
    set({
      ready: true,
      presetId,
      enabled: resolved.enabled,
    });
    await persist(presetId, resolved.enabled);
    return resolved.adjustments;
  },

  setFeature: async (id, value) => {
    const current = get().enabled;
    const adjustments: FeatureAdjustment[] = [];
    let nextEnabled: Record<FeatureId, boolean>;

    if (value) {
      const normalized = normalizeFeatures({
        ...current,
        [id]: true,
      });
      nextEnabled = normalized.enabled;
      adjustments.push(...normalized.adjustments);
    } else {
      const disabled = disableFeature(current, id);
      const normalized = normalizeFeatures(disabled.enabled);
      nextEnabled = normalized.enabled;
      adjustments.push(...disabled.adjustments, ...normalized.adjustments);
    }

    const presetId = matchPreset(nextEnabled);
    set({
      ready: true,
      presetId,
      enabled: nextEnabled,
    });
    await persist(presetId, nextEnabled);
    return adjustments;
  },

  reset: async () => {
    await get().applyPreset(DEFAULT_PRESET);
  },

  isEnabled: (id) => get().enabled[id],
}));
