import type { Period, PeriodMode } from '../periods/types';

/** Recurring modes that can be automated. Custom ranges are one-off overrides. */
export type GroupPeriodMode = Extract<
  PeriodMode,
  'calendar_month' | 'start_day' | 'cutoff_day'
>;

export type GroupPeriodLike = {
  year: number;
  /** Zero-based anchor month. */
  month: number;
  period_start?: number | null;
  period_end?: number | null;
};

export type GroupPeriod = Period & {
  mode: GroupPeriodMode;
  /** Zero-based anchor month. */
  year: number;
  month: number;
};
