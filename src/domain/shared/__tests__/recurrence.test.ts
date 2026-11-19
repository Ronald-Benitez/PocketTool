import { resolveNextMonthlyDay } from '../recurrence';

describe('resolveNextMonthlyDay', () => {
  const now = new Date(2026, 10, 17, 10, 30).getTime(); // Nov 17, 2026

  it('uses the current month when the day is still ahead', () => {
    expect(resolveNextMonthlyDay({ now, day: 20 })).toBe(
      new Date(2026, 10, 20, 12, 0, 0, 0).getTime()
    );
  });

  it('keeps today when the day matches today', () => {
    expect(resolveNextMonthlyDay({ now, day: 17 })).toBe(
      new Date(2026, 10, 17, 12, 0, 0, 0).getTime()
    );
  });

  it('moves to the next month when the day already passed', () => {
    expect(resolveNextMonthlyDay({ now, day: 5 })).toBe(
      new Date(2026, 11, 5, 12, 0, 0, 0).getTime()
    );
  });

  it('moves to the next year from December', () => {
    const december = new Date(2026, 11, 31, 10, 0, 0, 0).getTime();
    expect(resolveNextMonthlyDay({ now: december, day: 5 })).toBe(
      new Date(2027, 0, 5, 12, 0, 0, 0).getTime()
    );
  });

  it('clamps the day to the last day of February', () => {
    const february = new Date(2026, 1, 10, 10, 0, 0, 0).getTime();
    expect(resolveNextMonthlyDay({ now: february, day: 31 })).toBe(
      new Date(2026, 1, 28, 12, 0, 0, 0).getTime()
    );
  });

  it('clamps February 29 in a leap year', () => {
    const february = new Date(2028, 1, 10, 10, 0, 0, 0).getTime();
    expect(resolveNextMonthlyDay({ now: february, day: 31 })).toBe(
      new Date(2028, 1, 29, 12, 0, 0, 0).getTime()
    );
  });

  it('moves day 1 to the next month after the first', () => {
    const middle = new Date(2026, 0, 15, 10, 0, 0, 0).getTime();
    expect(resolveNextMonthlyDay({ now: middle, day: 1 })).toBe(
      new Date(2026, 1, 1, 12, 0, 0, 0).getTime()
    );
  });

  it('falls back to now without a valid day', () => {
    expect(resolveNextMonthlyDay({ now })).toBe(now);
    expect(resolveNextMonthlyDay({ now, day: 0 })).toBe(now);
    expect(resolveNextMonthlyDay({ now, day: null })).toBe(now);
  });
});
