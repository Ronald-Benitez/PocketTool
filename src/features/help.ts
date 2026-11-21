import type { HelpTopicId } from '@/src/help/types';

import type { FeatureId } from './types';

export const HELP_TOPIC_FEATURES: Partial<Record<HelpTopicId, FeatureId>> = {
  summaries: 'summaries',
  fixeds: 'fixeds',
  financings: 'financings',
  credits: 'credits',
  budgets: 'budget',
  budgetTemplates: 'budget',
  savings: 'savings',
  vehicle: 'vehicle',
  vehicleFuel: 'vehicle',
  vehicleMaintenance: 'vehicle',
  vehicleReminders: 'vehicle',
  closing: 'closing',
  people: 'people',
  sharedPurchases: 'shared',
  settlements: 'people',
  filters: 'filters',
  charts: 'charts',
};

export const isHelpTopicEnabled = (
  id: HelpTopicId,
  enabled: Record<FeatureId, boolean>
): boolean => {
  const feature = HELP_TOPIC_FEATURES[id];
  return !feature || enabled[feature];
};
