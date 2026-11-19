export const lastDayOfMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export type NextMonthlyDayInput = {
  now: number;
  /** Day of the month configured by the user. */
  day?: number | null;
};

/**
 * Resolves the next occurrence of a monthly day, starting today.
 *
 * - A missing or invalid day falls back to `now`.
 * - The day is clamped to the last day of the target month.
 * - A day equal to today keeps today; a day already passed moves to the next
 *   month.
 * - Noon avoids timezone/DST shifts moving the date to another day.
 */
export const resolveNextMonthlyDay = ({
  now,
  day,
}: NextMonthlyDayInput): number => {
  if (day == null || !Number.isFinite(day) || day <= 0) return now;

  const reference = new Date(now);
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const targetDay = Math.min(Math.floor(day), lastDayOfMonth(year, month));

  if (targetDay >= reference.getDate()) {
    return new Date(year, month, targetDay, 12, 0, 0, 0).getTime();
  }

  const nextMonth = new Date(year, month + 1, 1, 12, 0, 0, 0);
  const nextMonthYear = nextMonth.getFullYear();
  const nextMonthIndex = nextMonth.getMonth();
  const nextTargetDay = Math.min(
    Math.floor(day),
    lastDayOfMonth(nextMonthYear, nextMonthIndex)
  );

  return new Date(
    nextMonthYear,
    nextMonthIndex,
    nextTargetDay,
    12,
    0,
    0,
    0
  ).getTime();
};
