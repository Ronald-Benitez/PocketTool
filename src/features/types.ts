import type { TranslationKey } from '@/src/lang/messages';

export type FeatureId =
  | 'summaries'
  | 'fixeds'
  | 'financings'
  | 'credits'
  | 'budget'
  | 'charts'
  | 'filters'
  | 'savings'
  | 'vehicle'
  | 'shopping'
  | 'closing'
  | 'people'
  | 'shared'
  | 'advancedCatalogs'
  | 'quickAdd'
  | 'smartDefaults';

export type ExperiencePresetId = 'essential' | 'balanced' | 'complete';

export type ExperiencePresetSelection = ExperiencePresetId | 'custom';

export type FeatureGroup = 'modules' | 'advanced' | 'capture';

export type FeatureDefinition = {
  id: FeatureId;
  group: FeatureGroup;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  dependsOn?: FeatureId[];
  defaultInPreset: Record<ExperiencePresetId, boolean>;
};

export type ExperienceState = {
  version: 1;
  presetId: ExperiencePresetSelection;
  enabled: Record<FeatureId, boolean>;
};

export type FeatureAdjustment = {
  feature: FeatureId;
  action: 'enabled' | 'disabled';
  reason: FeatureId;
};

export type NormalizedFeatures = {
  enabled: Record<FeatureId, boolean>;
  adjustments: FeatureAdjustment[];
};
