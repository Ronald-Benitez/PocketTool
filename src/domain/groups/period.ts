import {
  anchorMonthForPeriod,
  nextPeriod,
  periodContains,
  periodForDate,
  resolvePeriod,
} from '../periods/period';
import type { Period } from '../periods/types';
import type { GroupPeriod, GroupPeriodLike, GroupPeriodMode } from './types';

type RecurringGroupPeriodInput = {
  mode: GroupPeriodMode;
  /** Zero-based anchor month. */
  month: number;
  year: number;
  startDay?: number | null;
  cutoffDay?: number | null;
};

export const resolveGroupPeriod = ({
  mode,
  month,
  year,
  startDay,
  cutoffDay,
}: RecurringGroupPeriodInput): Period =>
  resolvePeriod({ mode, year, month, startDay, cutoffDay });

/**
 * Reads the period stored on a group. Legacy rows without explicit columns fall
 * back to the calendar month derived from `year`/`month`.
 */
export const groupPeriodFromRow = (group: GroupPeriodLike): Period => {
  if (group.period_start != null && group.period_end != null) {
    return { start: group.period_start, end: group.period_end };
  }
  return resolvePeriod({
    mode: 'calendar_month',
    year: group.year,
    month: group.month,
  });
};

export const groupPeriodContains = (group: GroupPeriodLike, date: number) =>
  periodContains(groupPeriodFromRow(group), date);

/**
 * Finds the recurring group period that contains `date`.
 */
export const resolveGroupPeriodForDate = ({
  mode,
  date,
  startDay,
  cutoffDay,
}: {
  mode: GroupPeriodMode;
  date: number;
  startDay?: number | null;
  cutoffDay?: number | null;
}): GroupPeriod | null => {
  const period = periodForDate({ mode, date, startDay, cutoffDay });
  if (!period) return null;
  return {
    start: period.start,
    end: period.end,
    mode,
    year: period.year,
    month: period.month,
  };
};

export const nextGroupPeriod = (
  period: Period,
  input: Omit<RecurringGroupPeriodInput, 'year' | 'month'>
): GroupPeriod | null => {
  const next = nextPeriod(period, input);
  if (!next) return null;
  return {
    start: next.start,
    end: next.end,
    mode: input.mode,
    year: next.year,
    month: next.month,
  };
};

export const anchorMonthForGroupPeriod = (
  period: Period,
  mode: GroupPeriodMode
) => anchorMonthForPeriod({ ...period, mode });
