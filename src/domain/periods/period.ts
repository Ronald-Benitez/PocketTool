import type {
  Period,
  PeriodForDateInput,
  PeriodInput,
  PeriodMode,
} from './types';

export const DAY_MS = 24 * 60 * 60 * 1000;

export const lastDayOfMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const clampDay = (year: number, month: number, day: number) =>
  Math.max(1, Math.min(Math.floor(day), lastDayOfMonth(year, month)));

export const startOfDay = (year: number, month: number, day: number) =>
  new Date(year, month, day, 0, 0, 0, 0).getTime();

export const endOfDay = (year: number, month: number, day: number) =>
  new Date(year, month, day, 23, 59, 59, 999).getTime();

export const startOfLocalDay = (timestamp: number) => {
  const date = new Date(timestamp);
  return startOfDay(date.getFullYear(), date.getMonth(), date.getDate());
};

export const endOfLocalDay = (timestamp: number) => {
  const date = new Date(timestamp);
  return endOfDay(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDaysEndOfDay = (timestamp: number, days: number) => {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

export const deadlineFromPeriodEnd = (
  periodEnd: number,
  graceDays: number
) => addDaysEndOfDay(endOfLocalDay(periodEnd), Math.max(0, graceDays));

const startOfNextPeriod = (
  year: number,
  month: number,
  requestedDay: number
) => {
  const next = new Date(year, month + 1, 1);
  const nextYear = next.getFullYear();
  const nextMonth = next.getMonth();
  return startOfDay(
    nextYear,
    nextMonth,
    clampDay(nextYear, nextMonth, requestedDay)
  );
};

/**
 * Resolves a contiguous period. `month` is zero-based.
 *
 * - `calendar_month`: first to last day of the anchor month.
 * - `start_day`: from the configured day to the day before the same day of the
 *   next month. Short months clamp the day, so periods never overlap or leave
 *   gaps.
 * - `cutoff_day`: ends on the configured day of the anchor month and starts the
 *   day after the previous month's cutoff.
 * - `custom_range`: explicit start and end. Only used as a per-operation
 *   override, never for automatic generation.
 */
export const resolvePeriod = ({
  mode,
  year,
  month,
  cutoffDay,
  startDay,
  customStart,
  customEnd,
}: PeriodInput): Period => {
  let start: number;
  let end: number;

  if (mode === 'custom_range' && customStart != null && customEnd != null) {
    start = startOfLocalDay(customStart);
    end = endOfLocalDay(customEnd);
  } else if (mode === 'cutoff_day') {
    const requestedDay = cutoffDay ?? lastDayOfMonth(year, month);
    const cutoff = clampDay(year, month, requestedDay);
    end = endOfDay(year, month, cutoff);

    const previous = new Date(year, month - 1, 1);
    const previousYear = previous.getFullYear();
    const previousMonth = previous.getMonth();
    const previousCutoff = clampDay(
      previousYear,
      previousMonth,
      requestedDay
    );
    start = endOfDay(previousYear, previousMonth, previousCutoff) + 1;
  } else if (mode === 'start_day') {
    const requestedDay = startDay ?? 1;
    const startDayOfMonth = clampDay(year, month, requestedDay);
    start = startOfDay(year, month, startDayOfMonth);
    end = startOfNextPeriod(year, month, requestedDay) - 1;
  } else {
    start = startOfDay(year, month, 1);
    end = endOfDay(
      year,
      month,
      lastDayOfMonth(year, month)
    );
  }

  if (end < start) {
    throw new Error('PERIOD_INVALID');
  }

  return { start, end };
};

export const anchorMonthForPeriod = ({
  mode,
  start,
  end,
}: Pick<Period, 'start' | 'end'> & { mode: PeriodMode }) => {
  // A cutoff period is labeled by the month where it ends; start-day and
  // calendar periods are labeled by the month where they start.
  const reference = new Date(mode === 'cutoff_day' ? end : start);
  return { year: reference.getFullYear(), month: reference.getMonth() };
};

/**
 * Finds the period that contains `date` and its anchor month.
 * Custom ranges are not recurring and return `null`.
 */
export const periodForDate = ({
  mode,
  date,
  startDay,
  cutoffDay,
}: PeriodForDateInput): (Period & { mode: PeriodMode; year: number; month: number }) | null => {
  if (mode === 'custom_range') return null;

  const reference = new Date(date);
  const year = reference.getFullYear();
  const month = reference.getMonth();
  let anchorYear = year;
  let anchorMonth = month;

  if (mode === 'start_day') {
    const requestedDay = startDay ?? 1;
    const startThisMonth = clampDay(year, month, requestedDay);
    if (reference.getDate() < startThisMonth) {
      const previous = new Date(year, month - 1, 1);
      anchorYear = previous.getFullYear();
      anchorMonth = previous.getMonth();
    }
  } else if (mode === 'cutoff_day') {
    const requestedDay = cutoffDay ?? lastDayOfMonth(year, month);
    const cutoffThisMonth = clampDay(year, month, requestedDay);
    if (reference.getDate() > cutoffThisMonth) {
      const next = new Date(year, month + 1, 1);
      anchorYear = next.getFullYear();
      anchorMonth = next.getMonth();
    }
  }

  const period = resolvePeriod({
    mode,
    year: anchorYear,
    month: anchorMonth,
    startDay,
    cutoffDay,
  });

  return {
    ...period,
    mode,
    year: anchorYear,
    month: anchorMonth,
  };
};

export const periodContains = (period: Period, date: number) =>
  date >= period.start && date <= period.end;

/** True when the period covers exactly one calendar month. */
export const isCalendarMonthPeriod = (period: Period) => {
  const start = new Date(period.start);
  const end = new Date(period.end);
  return (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === 1 &&
    end.getDate() === lastDayOfMonth(end.getFullYear(), end.getMonth())
  );
};

/**
 * Resolves the occurrence of a monthly day inside a period. Returns `null` when
 * the day does not fall inside the period. Noon avoids DST shifts moving the
 * proposed date to another day.
 */
export const resolveDayInPeriod = (
  period: Period,
  day: number | null | undefined
): number | null => {
  if (day == null || !Number.isFinite(day) || day <= 0) return null;

  const startDate = new Date(period.start);
  const months = [0, 1].map((offset) =>
    new Date(startDate.getFullYear(), startDate.getMonth() + offset, 1)
  );

  // Prefer the real day when it exists in one of the months covered by the
  // period. Only clamp when neither month has that day, so a period from
  // February 28 to March 30 keeps day 30 in March instead of clamping it to
  // February 28.
  const exact = months
    .filter(
      (monthDate) =>
        day <= lastDayOfMonth(monthDate.getFullYear(), monthDate.getMonth())
    )
    .map((monthDate) =>
      new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        Math.floor(day),
        12,
        0,
        0,
        0
      ).getTime()
    )
    .find((candidate) => periodContains(period, candidate));
  if (exact != null) return exact;

  const clamped = months
    .map((monthDate) =>
      new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        clampDay(monthDate.getFullYear(), monthDate.getMonth(), day),
        12,
        0,
        0,
        0
      ).getTime()
    )
    .find((candidate) => periodContains(period, candidate));

  return clamped ?? null;
};

/**
 * Next contiguous period, or `null` for a custom range.
 */
export const nextPeriod = (
  period: Period,
  input: Omit<PeriodForDateInput, 'date'>
): (Period & { year: number; month: number }) | null => {
  const next = periodForDate({
    ...input,
    date: period.end + 1,
  });
  if (!next) return null;
  return { start: next.start, end: next.end, year: next.year, month: next.month };
};
