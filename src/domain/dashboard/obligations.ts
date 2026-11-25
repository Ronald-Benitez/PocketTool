export type DashboardObligationUrgency =
  | 'overdue'
  | 'today'
  | 'soon'
  | 'later';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar day index in UTC, used to compare days without DST drift. */
const dayIndex = (timestamp: number) => {
  const date = new Date(timestamp);
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS
  );
};

export type ClassifyObligationInput = {
  date: number;
  now: number;
  /** Days ahead that still count as `soon`. Defaults to 7. */
  horizonDays?: number;
};

/**
 * Classifies a due date relative to today.
 *
 * Uses calendar days, not elapsed milliseconds, so an item tomorrow at 00:01 is
 * `soon` even if fewer than 24 hours have passed.
 */
export const classifyObligationDate = ({
  date,
  now,
  horizonDays = 7,
}: ClassifyObligationInput): DashboardObligationUrgency => {
  const delta = dayIndex(date) - dayIndex(now);
  if (delta < 0) return 'overdue';
  if (delta === 0) return 'today';
  if (delta <= Math.max(0, horizonDays)) return 'soon';
  return 'later';
};

const URGENCY_ORDER: Record<DashboardObligationUrgency, number> = {
  overdue: 0,
  today: 1,
  soon: 2,
  later: 3,
};

export type SortableObligation = {
  date: number;
};

/**
 * Sorts obligations by urgency and then by date. Returns a new array.
 */
export const sortObligations = <T extends SortableObligation>(
  items: T[],
  now: number
): T[] =>
  [...items].sort((left, right) => {
    const leftUrgency = classifyObligationDate({ date: left.date, now });
    const rightUrgency = classifyObligationDate({ date: right.date, now });
    const urgencyDelta =
      URGENCY_ORDER[leftUrgency] - URGENCY_ORDER[rightUrgency];
    if (urgencyDelta !== 0) return urgencyDelta;
    return left.date - right.date;
  });

export type DashboardObligationGroup<T extends SortableObligation> = {
  urgency: DashboardObligationUrgency;
  items: T[];
};

/**
 * Groups sorted obligations into overdue, today, soon and later buckets.
 * Empty buckets are omitted.
 */
export const groupObligationsByUrgency = <T extends SortableObligation>(
  items: T[],
  now: number
): DashboardObligationGroup<T>[] => {
  const groups: DashboardObligationGroup<T>[] = [];
  for (const item of sortObligations(items, now)) {
    const urgency = classifyObligationDate({ date: item.date, now });
    const current = groups[groups.length - 1];
    if (current?.urgency === urgency) {
      current.items.push(item);
    } else {
      groups.push({ urgency, items: [item] });
    }
  }
  return groups;
};
