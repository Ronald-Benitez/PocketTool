import type { ClosingPeriod, ClosingPeriodInput } from './types';

export const DAY_MS = 24 * 60 * 60 * 1000;

export const lastDayOfMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const clampDay = (year: number, month: number, day: number) =>
  Math.max(
    1,
    Math.min(Math.floor(day), lastDayOfMonth(year, month))
  );

const startOfDay = (year: number, month: number, day: number) =>
  new Date(year, month, day, 0, 0, 0, 0).getTime();

const endOfDay = (year: number, month: number, day: number) =>
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

/**
 * Resolves the accounting period and its edit deadline.
 *
 * `groupMonth` is zero-based. `cutoff_day` uses the group month as the month
 * where the cutoff ends. A custom range is normalized to whole local days.
 */
export const resolveClosingPeriod = ({
  mode,
  groupYear,
  groupMonth,
  cutoffDay,
  startDay,
  graceDays,
  customStart,
  customEnd,
  editableUntil,
}: ClosingPeriodInput): ClosingPeriod => {
  let start: number;
  let end: number;

  if (mode === 'custom_range' && customStart != null && customEnd != null) {
    start = startOfLocalDay(customStart);
    end = endOfLocalDay(customEnd);
  } else if (mode === 'cutoff_day') {
    const requestedDay = cutoffDay ?? lastDayOfMonth(groupYear, groupMonth);
    const cutoff = clampDay(groupYear, groupMonth, requestedDay);
    end = endOfDay(groupYear, groupMonth, cutoff);

    const previous = new Date(groupYear, groupMonth - 1, 1);
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
    const startDayOfMonth = clampDay(groupYear, groupMonth, requestedDay);
    start = startOfDay(groupYear, groupMonth, startDayOfMonth);

    const next = new Date(groupYear, groupMonth + 1, 1);
    const nextYear = next.getFullYear();
    const nextMonth = next.getMonth();
    const endDayOfMonth = clampDay(nextYear, nextMonth, requestedDay);
    end = endOfDay(nextYear, nextMonth, endDayOfMonth);
  } else {
    start = startOfDay(groupYear, groupMonth, 1);
    end = endOfDay(
      groupYear,
      groupMonth,
      lastDayOfMonth(groupYear, groupMonth)
    );
  }

  if (end < start) {
    throw new Error('CLOSING_INVALID_PERIOD');
  }

  const grace = Math.max(0, Math.floor(graceDays));
  const deadline = editableUntil ?? addDaysEndOfDay(end, grace);

  if (deadline < end) {
    throw new Error('CLOSING_INVALID_PERIOD');
  }

  return { start, end, editableUntil: deadline };
};

export const isClosingEditable = (
  editableUntil: number,
  now = Date.now()
) => now <= editableUntil;
