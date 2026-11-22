import {
  DASHBOARD_ACTIONS,
  DASHBOARD_ACTION_IDS,
  DASHBOARD_BLOCK_IDS,
  DASHBOARD_BLOCKS,
  DEFAULT_DASHBOARD_QUICK_ACTIONS,
  isDashboardActionId,
  isDashboardBlockId,
} from './registry';
import {
  DASHBOARD_LAYOUT_VERSION,
  type DashboardActionId,
  type DashboardBlockId,
  type DashboardBlockState,
  type DashboardLayout,
} from './types';
import type { FeatureId } from '@/src/features';

export const MAX_QUICK_ACTIONS = 4;

export const createDefaultDashboardLayout = (): DashboardLayout => ({
  version: DASHBOARD_LAYOUT_VERSION,
  blocks: DASHBOARD_BLOCK_IDS.map((id) => ({
    id,
    visible: DASHBOARD_BLOCKS[id].defaultVisible,
  })),
  quickActions: [...DEFAULT_DASHBOARD_QUICK_ACTIONS],
});

/**
 * Normalizes persisted or imported data.
 *
 * Unknown ids are dropped, duplicates keep their first position, missing blocks
 * are appended with their default visibility and `record` stays available as a
 * quick action.
 */
export const normalizeDashboardQuickActions = (
  value: unknown
): DashboardActionId[] => {
  const actions: DashboardActionId[] = [];
  const seen = new Set<DashboardActionId>();

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (!isDashboardActionId(entry) || seen.has(entry)) continue;
      seen.add(entry);
      actions.push(entry);
    }
  }

  if (actions.length === 0) return [...DEFAULT_DASHBOARD_QUICK_ACTIONS];

  const limited = actions.slice(0, MAX_QUICK_ACTIONS);
  if (!limited.includes('record')) {
    return ['record', ...limited.slice(0, MAX_QUICK_ACTIONS - 1)];
  }
  return limited;
};

export const normalizeDashboardLayout = (value: unknown): DashboardLayout => {
  const defaults = createDefaultDashboardLayout();
  if (!value || typeof value !== 'object') return defaults;

  const source = value as { blocks?: unknown; quickActions?: unknown };
  const blocks: DashboardBlockState[] = [];
  const seen = new Set<DashboardBlockId>();

  if (Array.isArray(source.blocks)) {
    for (const entry of source.blocks) {
      if (!entry || typeof entry !== 'object') continue;
      const candidate = entry as { id?: unknown; visible?: unknown };
      if (!isDashboardBlockId(candidate.id) || seen.has(candidate.id)) continue;

      seen.add(candidate.id);
      blocks.push({
        id: candidate.id,
        visible:
          typeof candidate.visible === 'boolean'
            ? candidate.visible
            : DASHBOARD_BLOCKS[candidate.id].defaultVisible,
      });
    }
  }

  for (const id of DASHBOARD_BLOCK_IDS) {
    if (seen.has(id)) continue;
    blocks.push({ id, visible: DASHBOARD_BLOCKS[id].defaultVisible });
  }

  return {
    version: DASHBOARD_LAYOUT_VERSION,
    blocks,
    quickActions: normalizeDashboardQuickActions(source.quickActions),
  };
};

export const moveDashboardBlock = (
  layout: DashboardLayout,
  from: number,
  to: number
): DashboardLayout => {
  if (from === to) return layout;
  if (from < 0 || from >= layout.blocks.length) return layout;
  if (to < 0 || to >= layout.blocks.length) return layout;

  const blocks = [...layout.blocks];
  const [moved] = blocks.splice(from, 1);
  blocks.splice(to, 0, moved);
  return { ...layout, blocks };
};

export const setDashboardBlockVisibility = (
  layout: DashboardLayout,
  id: DashboardBlockId,
  visible: boolean
): DashboardLayout => {
  const current = layout.blocks.find((block) => block.id === id);
  if (!current || current.visible === visible) return layout;

  return {
    ...layout,
    blocks: layout.blocks.map((block) =>
      block.id === id ? { ...block, visible } : block
    ),
  };
};

export const setDashboardQuickActions = (
  layout: DashboardLayout,
  actions: DashboardActionId[]
): DashboardLayout => {
  const quickActions = normalizeDashboardQuickActions(actions);
  if (
    quickActions.length === layout.quickActions.length &&
    quickActions.every((action, index) => action === layout.quickActions[index])
  ) {
    return layout;
  }
  return { ...layout, quickActions };
};

export const resetDashboardLayout = (): DashboardLayout =>
  createDefaultDashboardLayout();

export const getVisibleDashboardBlocks = (
  layout: DashboardLayout
): DashboardBlockState[] => layout.blocks.filter((block) => block.visible);

export const isDashboardActionAvailable = (
  id: DashboardActionId,
  enabled: Partial<Record<FeatureId, boolean>>
) => {
  if (!DASHBOARD_ACTION_IDS.includes(id)) return false;
  const feature = DASHBOARD_ACTIONS[id].feature;
  return !feature || Boolean(enabled[feature]);
};
