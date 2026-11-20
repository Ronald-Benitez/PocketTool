import {
  lastDayOfMonth,
  resolveNextMonthlyDay,
} from '../shared/recurrence';
import { periodContains, resolveDayInPeriod } from '../periods/period';

export type FixedPendingDateMode = 'group_month' | 'next_occurrence';

export type FixedPendingDedupeMode = 'group' | 'period';

export type PendingFixedDateInput = {
  mode: FixedPendingDateMode;
  /** Unix timestamp used as the reference date and fallback. */
  now: number;
  /** Day of the month configured on the fixed transaction. */
  fixedDay?: number | null;
  /** Group year; the group month is zero-based. */
  groupYear?: number | null;
  groupMonth?: number | null;
  /** Resolved group period. Takes precedence over `groupYear`/`groupMonth`. */
  periodStart?: number | null;
  periodEnd?: number | null;
};

/**
 * Resolves the date proposed for a pending fixed transaction.
 *
 * - `group_month` uses the fixed day inside the selected group's period and
 *   clamps it to the month's last day. Legacy groups without an explicit
 *   period fall back to the calendar month of `groupYear`/`groupMonth`.
 * - `next_occurrence` uses the next occurrence of the fixed day from today,
 *   ignoring the group period.
 * - A missing fixed day falls back to `now`.
 */
export const resolvePendingFixedDate = ({
  mode,
  now,
  fixedDay,
  groupYear,
  groupMonth,
  periodStart,
  periodEnd,
}: PendingFixedDateInput): number => {
  if (mode === 'next_occurrence') {
    return resolveNextMonthlyDay({ now, day: fixedDay });
  }

  if (fixedDay == null || fixedDay <= 0) return now;

  if (periodStart != null && periodEnd != null) {
    const date = resolveDayInPeriod(
      { start: periodStart, end: periodEnd },
      fixedDay
    );
    return date ?? now;
  }

  const reference = new Date(now);
  const year = groupYear ?? reference.getFullYear();
  const month = groupMonth ?? reference.getMonth();
  const day = Math.max(
    1,
    Math.min(Math.floor(fixedDay), lastDayOfMonth(year, month))
  );

  // Noon avoids timezone shifts moving the record to the previous/next day.
  return new Date(year, month, day, 12, 0, 0, 0).getTime();
};

export type FixedPendingRecordRef = {
  fixed_id?: number | null;
  date: number;
  group_id?: number | null;
};

export type PendingFixedPaidInput = {
  mode: FixedPendingDedupeMode;
  fixedId: number;
  /** Proposed date for the pending fixed transaction. */
  targetDate: number;
  /** Selected group id. Required for `group` deduplication. */
  groupId?: number | null;
  /** Resolved group period. When present, `period` dedupe uses it. */
  periodStart?: number | null;
  periodEnd?: number | null;
  records: readonly FixedPendingRecordRef[];
};

/**
 * Tells whether a fixed transaction is already recorded.
 *
 * - `group` checks for a record linked to the fixed in the selected group.
 * - `period` checks for a record linked to the fixed whose date falls inside
 *   the selected group period. Legacy calls without a period fall back to the
 *   calendar month of the proposed date.
 */
export const isFixedPendingPaid = ({
  mode,
  fixedId,
  targetDate,
  groupId,
  periodStart,
  periodEnd,
  records,
}: PendingFixedPaidInput): boolean => {
  const matching = records.filter((record) => record.fixed_id === fixedId);

  if (mode === 'group') {
    if (groupId == null) return false;
    return matching.some((record) => record.group_id === groupId);
  }

  if (periodStart != null && periodEnd != null) {
    return matching.some((record) =>
      periodContains({ start: periodStart, end: periodEnd }, record.date)
    );
  }

  const target = new Date(targetDate);
  const start = new Date(
    target.getFullYear(),
    target.getMonth(),
    1,
    0,
    0,
    0,
    0
  ).getTime();
  const end = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  ).getTime();

  return matching.some((record) => record.date >= start && record.date < end);
};
