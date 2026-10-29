import type { PaymentMethod } from '@/src/interfaces/schema';

export const lastDayOfMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const cutoffEnd = (card: PaymentMethod, month: number, year: number) => {
  if (!card?.closing_date) return 0;
  const day = Math.min(card.closing_date, lastDayOfMonth(year, month));
  return new Date(year, month, day, 23, 59, 59, 999).getTime();
};

/**
 * Returns the period that ends on the given billing month's cutoff day.
 * `billingMonth` is zero-based and may be outside 0..11; Date normalizes it.
 */
export const getPeriods = (card: PaymentMethod, billingMonth: number, year: number) => {
  if (!card?.closing_date) return [0, 0] as const;

  const periodEnd = cutoffEnd(card, billingMonth, year);
  const periodStart = cutoffEnd(card, billingMonth - 1, year) + 1;

  return [periodStart, periodEnd] as const;
};

/**
 * If today is already past the cutoff, the active period ends next month.
 */
export const getBillingMonth = (card: PaymentMethod, date = new Date()) =>
  date.getDate() <= (card.closing_date || 0)
    ? date.getMonth()
    : date.getMonth() + 1;

export type CreditPeriodTotals = {
  currentPeriodStart: number;
  currentPeriodEnd: number;
  previousPeriodStart: number;
  previousPeriodEnd: number;
};

export const getCreditPeriods = (
  card: PaymentMethod,
  date = new Date()
): CreditPeriodTotals => {
  const billingMonth = getBillingMonth(card, date);
  const year = date.getFullYear();
  const [currentPeriodStart, currentPeriodEnd] = getPeriods(card, billingMonth, year);
  const [previousPeriodStart, previousPeriodEnd] = getPeriods(
    card,
    billingMonth - 1,
    year
  );

  return {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd,
  };
};
