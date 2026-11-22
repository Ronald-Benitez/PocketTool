import type { FeatureId } from '@/src/features';

import { DASHBOARD_BLOCKS } from './registry';
import type {
  DashboardBlockDefinition,
  DashboardBlockId,
  DashboardLayout,
} from './types';

export type DashboardBlockTarget = {
  href: string;
  feature: FeatureId | null;
};

/**
 * Routes reached from each dashboard block. Aggregated blocks point to the
 * primary module that lists their items; every row still navigates to its own
 * module.
 */
export const DASHBOARD_BLOCK_TARGETS: Record<
  DashboardBlockId,
  DashboardBlockTarget | null
> = {
  summary: { href: '/(summaries)', feature: 'summaries' },
  obligations: { href: '/(fixeds)', feature: 'fixeds' },
  budget: { href: '/(budget)', feature: 'budget' },
  savings: { href: '/(savings)', feature: 'savings' },
  people: { href: '/(people)', feature: 'people' },
  recentRecords: {
    href: '/(financials)/RecordsScreen',
    feature: null,
  },
  credits: { href: '/(credits)', feature: 'credits' },
  vehicle: { href: '/(vehicle)', feature: 'vehicle' },
  closing: { href: '/(closing)', feature: 'closing' },
};

export const resolveDashboardBlockTarget = (
  id: DashboardBlockId
): DashboardBlockTarget | null => DASHBOARD_BLOCK_TARGETS[id] ?? null;

export const isDashboardTargetEnabled = (
  target: DashboardBlockTarget | null,
  enabled: Partial<Record<FeatureId, boolean>>
) => !target?.feature || Boolean(enabled[target.feature]);

/**
 * A block is available when its own feature is enabled. Aggregated blocks with
 * `relatedFeatures` are available when at least one of them is enabled.
 */
export const isDashboardBlockAvailable = (
  id: DashboardBlockId,
  enabled: Partial<Record<FeatureId, boolean>>
) => {
  const feature = DASHBOARD_BLOCKS[id].feature;
  if (feature) return Boolean(enabled[feature]);

  const related = DASHBOARD_BLOCKS[id].relatedFeatures;
  if (!related || related.length === 0) return true;
  return related.some((item) => Boolean(enabled[item]));
};

/**
 * Returns the definitions that should render, preserving the saved order and
 * skipping hidden blocks and blocks whose module is disabled.
 */
export const getAvailableDashboardBlocks = (
  layout: DashboardLayout,
  enabled: Partial<Record<FeatureId, boolean>>
): DashboardBlockDefinition[] =>
  layout.blocks
    .filter(
      (block) => block.visible && isDashboardBlockAvailable(block.id, enabled)
    )
    .map((block) => DASHBOARD_BLOCKS[block.id]);
