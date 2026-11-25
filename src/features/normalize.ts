import {
  EXPERIENCE_PRESET_IDS,
  FEATURE_DEFINITIONS,
  FEATURE_IDS,
} from './definitions';
import type {
  ExperiencePresetId,
  ExperiencePresetSelection,
  FeatureAdjustment,
  FeatureId,
  NormalizedFeatures,
} from './types';

export const createDefaultEnabled = (
  presetId: ExperiencePresetId
): Record<FeatureId, boolean> =>
  FEATURE_IDS.reduce((enabled, id) => {
    enabled[id] = FEATURE_DEFINITIONS[id].defaultInPreset[presetId];
    return enabled;
  }, {} as Record<FeatureId, boolean>);

const adjustmentKey = (adjustment: FeatureAdjustment) =>
  `${adjustment.feature}:${adjustment.action}:${adjustment.reason}`;

export const normalizeFeatures = (
  input: Record<FeatureId, boolean>
): NormalizedFeatures => {
  const enabled = { ...input };
  const adjustments: FeatureAdjustment[] = [];
  const seen = new Set<string>();

  const push = (adjustment: FeatureAdjustment) => {
    const key = adjustmentKey(adjustment);
    if (seen.has(key)) return;
    seen.add(key);
    adjustments.push(adjustment);
  };

  let changed = true;
  while (changed) {
    changed = false;

    for (const id of FEATURE_IDS) {
      if (!enabled[id]) continue;
      for (const dependency of FEATURE_DEFINITIONS[id].dependsOn ?? []) {
        if (enabled[dependency]) continue;
        enabled[dependency] = true;
        push({ feature: dependency, action: 'enabled', reason: id });
        changed = true;
      }
    }
  }

  return { enabled, adjustments };
};

export const disableFeature = (
  input: Record<FeatureId, boolean>,
  id: FeatureId
): NormalizedFeatures => {
  const enabled = { ...input };
  const adjustments: FeatureAdjustment[] = [];
  const seen = new Set<string>();

  const push = (adjustment: FeatureAdjustment) => {
    const key = adjustmentKey(adjustment);
    if (seen.has(key)) return;
    seen.add(key);
    adjustments.push(adjustment);
  };

  const disable = (featureId: FeatureId, reason: FeatureId) => {
    if (featureId !== reason && !enabled[featureId]) return;

    enabled[featureId] = false;
    if (featureId !== reason) {
      push({ feature: featureId, action: 'disabled', reason });
    }

    for (const dependentId of FEATURE_IDS) {
      if (!FEATURE_DEFINITIONS[dependentId].dependsOn?.includes(featureId)) {
        continue;
      }
      disable(dependentId, reason);
    }
  };

  disable(id, id);
  return { enabled, adjustments };
};

export const applyPreset = (
  presetId: ExperiencePresetId
): NormalizedFeatures => normalizeFeatures(createDefaultEnabled(presetId));

const presetComparable = (enabled: Record<FeatureId, boolean>) =>
  FEATURE_IDS.filter(
    (id) => FEATURE_DEFINITIONS[id].group !== 'capture'
  ).map((id) => (enabled[id] ? '1' : '0'));

export const matchPreset = (
  enabled: Record<FeatureId, boolean>
): ExperiencePresetSelection => {
  const current = presetComparable(enabled).join('');
  for (const presetId of EXPERIENCE_PRESET_IDS) {
    const candidate = applyPreset(presetId);
    if (presetComparable(candidate.enabled).join('') === current) {
      return presetId;
    }
  }
  return 'custom';
};
