import {
  lastDayOfMonth,
  resolveNextMonthlyDay,
} from '../shared/recurrence';
import { resolveDayInPeriod } from '../periods/period';

export type PendingPaymentDateMode =
  | 'today'
  | 'payment_date'
  | 'next_payment_date';

export type PendingPaymentDateInput = {
  mode: PendingPaymentDateMode;
  /** Unix timestamp used as the fallback and to resolve missing group data. */
  now: number;
  /** Group year; the group month is zero-based. */
  groupYear?: number | null;
  groupMonth?: number | null;
  /** Day of the month configured on the card. */
  paymentDay?: number | null;
  /** Resolved group period. Takes precedence over `groupYear`/`groupMonth`. */
  periodStart?: number | null;
  periodEnd?: number | null;
};

/**
 * Resolves the date proposed for a pending card payment in Records.
 *
 * - `today` keeps the current behavior.
 * - `payment_date` uses the card's payment day inside the selected group's
 *   period and clamps it to the month's last day. Legacy groups without an
 *   explicit period fall back to the calendar month.
 * - `next_payment_date` uses the next occurrence of the card's payment day from
 *   today, matching the date shown in the Credits section.
 * - A missing payment day falls back to `today`.
 */
export const resolvePendingPaymentDate = ({
  mode,
  now,
  groupYear,
  groupMonth,
  paymentDay,
  periodStart,
  periodEnd,
}: PendingPaymentDateInput): number => {
  if (mode === 'today') return now;
  if (paymentDay == null || paymentDay <= 0) return now;

  if (mode === 'next_payment_date') {
    return resolveNextMonthlyDay({ now, day: paymentDay });
  }

  if (periodStart != null && periodEnd != null) {
    const date = resolveDayInPeriod(
      { start: periodStart, end: periodEnd },
      paymentDay
    );
    return date ?? now;
  }

  const reference = new Date(now);
  const year = groupYear ?? reference.getFullYear();
  const month = groupMonth ?? reference.getMonth();
  const day = Math.max(
    1,
    Math.min(Math.floor(paymentDay), lastDayOfMonth(year, month))
  );

  // Noon avoids timezone shifts moving the record to the previous/next day.
  return new Date(year, month, day, 12, 0, 0, 0).getTime();
};
