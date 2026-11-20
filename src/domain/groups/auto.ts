import { groupPeriodContains, resolveGroupPeriodForDate } from './period';
import type { GroupPeriod, GroupPeriodLike, GroupPeriodMode } from './types';

export type PlanCurrentGroupInput = {
  mode: GroupPeriodMode;
  startDay?: number | null;
  cutoffDay?: number | null;
  now: number;
  /** Includes active and soft-deleted rows; a deleted group is respected. */
  groups: readonly GroupPeriodLike[];
};

/**
 * Decides whether the current period needs a new group. Returns the period to
 * create, or `null` when a group already covers today or the mode is not
 * recurring.
 */
export const planCurrentGroup = ({
  mode,
  startDay,
  cutoffDay,
  now,
  groups,
}: PlanCurrentGroupInput): GroupPeriod | null => {
  const target = resolveGroupPeriodForDate({
    mode,
    date: now,
    startDay,
    cutoffDay,
  });
  if (!target) return null;

  const covered = groups.some((group) => groupPeriodContains(group, now));
  return covered ? null : target;
};
