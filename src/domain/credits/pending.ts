export type PendingPaymentDateMode = 'today' | 'payment_date';

export type PendingPaymentDateInput = {
  mode: PendingPaymentDateMode;
  /** Unix timestamp used as the fallback and to resolve missing group data. */
  now: number;
  /** Group year; the group month is zero-based. */
  groupYear?: number | null;
  groupMonth?: number | null;
  /** Day of the month configured on the card. */
  paymentDay?: number | null;
};

const lastDayOfMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

/**
 * Resolves the date proposed for a pending card payment in Records.
 *
 * - `today` keeps the current behavior.
 * - `payment_date` uses the card's payment day within the selected group's
 *   month, clamped to that month's last day.
 * - A missing payment day falls back to `today`.
 */
export const resolvePendingPaymentDate = ({
  mode,
  now,
  groupYear,
  groupMonth,
  paymentDay,
}: PendingPaymentDateInput): number => {
  if (mode !== 'payment_date' || paymentDay == null || paymentDay <= 0) {
    return now;
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
