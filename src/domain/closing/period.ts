import type { ClosingPeriod, ClosingPeriodInput } from './types';
import { deadlineFromPeriodEnd, resolvePeriod } from '../periods/period';

export {
  DAY_MS,
  deadlineFromPeriodEnd,
  endOfLocalDay,
  lastDayOfMonth,
  startOfLocalDay,
} from '../periods/period';

/**
 * Resolves the accounting period and its edit deadline.
 *
 * `groupMonth` is zero-based. `cutoff_day` uses the group month as the month
 * where the cutoff ends. A custom range is normalized to whole local days.
 *
 * The period is contiguous: a start-day period ends the day before the next
 * period starts, so short months never overlap or leave gaps.
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
  let period;
  try {
    period = resolvePeriod({
      mode,
      year: groupYear,
      month: groupMonth,
      cutoffDay,
      startDay,
      customStart,
      customEnd,
    });
  } catch {
    throw new Error('CLOSING_INVALID_PERIOD');
  }

  const grace = Math.max(0, Math.floor(graceDays));
  const deadline = editableUntil ?? deadlineFromPeriodEnd(period.end, grace);

  if (deadline < period.end) {
    throw new Error('CLOSING_INVALID_PERIOD');
  }

  return { start: period.start, end: period.end, editableUntil: deadline };
};

export const isClosingEditable = (
  editableUntil: number,
  now = Date.now()
) => now <= editableUntil;
