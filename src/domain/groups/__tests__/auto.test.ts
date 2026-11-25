import { planCurrentGroup } from '../auto';
import type { GroupPeriodLike } from '../types';

const calendarGroup = (year: number, month: number): GroupPeriodLike => ({
  year,
  month,
});

describe('planCurrentGroup', () => {
  it('creates the calendar month when there are no groups', () => {
    const now = new Date(2026, 10, 10, 12).getTime();
    const plan = planCurrentGroup({
      mode: 'calendar_month',
      now,
      groups: [],
    });

    expect(plan?.start).toBe(new Date(2026, 10, 1).getTime());
    expect(plan?.end).toBe(
      new Date(2026, 10, 30, 23, 59, 59, 999).getTime()
    );
    expect(plan?.year).toBe(2026);
    expect(plan?.month).toBe(10);
  });

  it('creates the start-day period containing today', () => {
    const now = new Date(2026, 10, 10, 12).getTime();
    const plan = planCurrentGroup({
      mode: 'start_day',
      startDay: 15,
      now,
      groups: [],
    });

    expect(plan?.start).toBe(new Date(2026, 9, 15).getTime());
    expect(plan?.end).toBe(
      new Date(2026, 10, 14, 23, 59, 59, 999).getTime()
    );
    expect(plan?.month).toBe(9);
  });

  it('does not create when an active group covers today', () => {
    const now = new Date(2026, 10, 10, 12).getTime();
    const plan = planCurrentGroup({
      mode: 'start_day',
      startDay: 15,
      now,
      groups: [calendarGroup(2026, 10)],
    });
    expect(plan).toBeNull();
  });

  it('does not recreate a period the user deleted', () => {
    const now = new Date(2026, 10, 10, 12).getTime();
    const plan = planCurrentGroup({
      mode: 'calendar_month',
      now,
      groups: [calendarGroup(2026, 10)],
    });
    expect(plan).toBeNull();
  });

  it('uses explicit periods when present', () => {
    const now = new Date(2026, 10, 10, 12).getTime();
    const plan = planCurrentGroup({
      mode: 'calendar_month',
      now,
      groups: [
        {
          year: 2026,
          month: 9,
          period_start: new Date(2026, 9, 15).getTime(),
          period_end: new Date(2026, 10, 14, 23, 59, 59, 999).getTime(),
        },
      ],
    });
    expect(plan).toBeNull();
  });
});
