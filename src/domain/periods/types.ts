export type PeriodMode =
  | 'calendar_month'
  | 'cutoff_day'
  | 'start_day'
  | 'custom_range';

/** Inclusive local-day range. `start` is 00:00:00.000 and `end` is 23:59:59.999. */
export type Period = {
  start: number;
  end: number;
};

export type PeriodInput = {
  mode: PeriodMode;
  /** Year used as the anchor for the period. */
  year: number;
  /** Zero-based anchor month. */
  month: number;
  cutoffDay?: number | null;
  startDay?: number | null;
  customStart?: number | null;
  customEnd?: number | null;
};

export type PeriodForDateInput = {
  mode: PeriodMode;
  /** Unix timestamp used to find the period that contains it. */
  date: number;
  startDay?: number | null;
  cutoffDay?: number | null;
};
