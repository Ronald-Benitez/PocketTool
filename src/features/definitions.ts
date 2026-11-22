import type { TranslationKey } from '@/src/lang/messages';

import type {
  ExperiencePresetId,
  ExperiencePresetSelection,
  FeatureDefinition,
  FeatureGroup,
  FeatureId,
} from './types';

export const FEATURE_IDS: FeatureId[] = [
  'summaries',
  'fixeds',
  'financings',
  'credits',
  'budget',
  'savings',
  'vehicle',
  'shopping',
  'closing',
  'people',
  'shared',
  'charts',
  'filters',
  'advancedCatalogs',
  'quickAdd',
  'smartDefaults',
];

export const FEATURE_GROUP_ORDER: FeatureGroup[] = [
  'modules',
  'advanced',
  'capture',
];

export const EXPERIENCE_PRESET_IDS: ExperiencePresetId[] = [
  'essential',
  'balanced',
  'complete',
];

export const PRESET_KEYS: Record<
  ExperiencePresetSelection,
  { labelKey: TranslationKey; descriptionKey: TranslationKey }
> = {
  essential: {
    labelKey: 'features.presets.essential.label',
    descriptionKey: 'features.presets.essential.description',
  },
  balanced: {
    labelKey: 'features.presets.balanced.label',
    descriptionKey: 'features.presets.balanced.description',
  },
  complete: {
    labelKey: 'features.presets.complete.label',
    descriptionKey: 'features.presets.complete.description',
  },
  custom: {
    labelKey: 'features.presets.custom.label',
    descriptionKey: 'features.presets.custom.description',
  },
};

const featureKey = (id: FeatureId, part: 'label' | 'description') =>
  `features.modules.${id}.${part}` as TranslationKey;

const definition = (
  id: FeatureId,
  group: FeatureGroup,
  presets: Record<ExperiencePresetId, boolean>,
  dependsOn?: FeatureId[]
): FeatureDefinition => ({
  id,
  group,
  labelKey: featureKey(id, 'label'),
  descriptionKey: featureKey(id, 'description'),
  dependsOn,
  defaultInPreset: presets,
});

export const FEATURE_DEFINITIONS: Record<FeatureId, FeatureDefinition> = {
  summaries: definition('summaries', 'modules', {
    essential: true,
    balanced: true,
    complete: true,
  }),
  fixeds: definition('fixeds', 'modules', {
    essential: false,
    balanced: true,
    complete: true,
  }),
  financings: definition(
    'financings',
    'modules',
    { essential: false, balanced: true, complete: true },
    ['fixeds']
  ),
  credits: definition('credits', 'modules', {
    essential: false,
    balanced: true,
    complete: true,
  }),
  budget: definition('budget', 'modules', {
    essential: false,
    balanced: true,
    complete: true,
  }),
  savings: definition('savings', 'modules', {
    essential: false,
    balanced: false,
    complete: true,
  }),
  vehicle: definition('vehicle', 'modules', {
    essential: false,
    balanced: false,
    complete: true,
  }),
  shopping: definition('shopping', 'modules', {
    essential: false,
    balanced: true,
    complete: true,
  }),
  closing: definition('closing', 'modules', {
    essential: false,
    balanced: false,
    complete: true,
  }),
  people: definition('people', 'modules', {
    essential: false,
    balanced: false,
    complete: true,
  }),
  shared: definition(
    'shared',
    'modules',
    { essential: false, balanced: false, complete: true },
    ['people']
  ),
  charts: definition('charts', 'advanced', {
    essential: false,
    balanced: true,
    complete: true,
  }),
  filters: definition('filters', 'advanced', {
    essential: false,
    balanced: true,
    complete: true,
  }),
  advancedCatalogs: definition('advancedCatalogs', 'advanced', {
    essential: false,
    balanced: false,
    complete: true,
  }),
  quickAdd: definition('quickAdd', 'capture', {
    essential: true,
    balanced: true,
    complete: false,
  }),
  smartDefaults: definition('smartDefaults', 'capture', {
    essential: true,
    balanced: true,
    complete: false,
  }),
};

export const FEATURE_DEFINITION_LIST: FeatureDefinition[] =
  FEATURE_IDS.map((id) => FEATURE_DEFINITIONS[id]);

export const getPresetLabelKey = (
  presetId: ExperiencePresetSelection
): TranslationKey => PRESET_KEYS[presetId].labelKey;

export const getPresetDescriptionKey = (
  presetId: ExperiencePresetSelection
): TranslationKey => PRESET_KEYS[presetId].descriptionKey;
