import type { FeatureId } from './types';

export type FeatureRoute = {
  feature: FeatureId;
  redirect: string;
};

const GROUP_FEATURES: Record<string, FeatureId> = {
  '(credits)': 'credits',
  '(savings)': 'savings',
  '(budget)': 'budget',
  '(vehicle)': 'vehicle',
  '(shopping)': 'shopping',
  '(closing)': 'closing',
  '(people)': 'people',
  '(summaries)': 'summaries',
};

export const resolveRouteFeature = (
  segments: readonly string[]
): FeatureRoute | null => {
  const [group, screen] = segments;
  if (!group) return null;

  if (group === '(financials)') {
    if (screen === 'PaymentTypesScreen' || screen === 'RecordTypesScreen') {
      return {
        feature: 'advancedCatalogs',
        redirect: '/',
      };
    }
    return null;
  }

  if (group === '(fixeds)') {
    if (screen === 'FinancingsScreen') {
      return { feature: 'financings', redirect: '/' };
    }
    return { feature: 'fixeds', redirect: '/' };
  }

  const feature = GROUP_FEATURES[group];
  if (!feature) return null;
  return { feature, redirect: '/' };
};
