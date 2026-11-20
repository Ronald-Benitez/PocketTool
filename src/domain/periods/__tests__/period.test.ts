import {
  anchorMonthForPeriod,
  nextPeriod,
  periodContains,
  periodForDate,
  resolveDayInPeriod,
  resolvePeriod,
} from '../period';

describe('resolvePeriod', () => {
  it('resolves a calendar month', () => {
    const period = resolvePeriod({
      mode: 'calendar_month',
      year: 2026,
      month: 1,
    });
    expect(period.start).toBe(new Date(2026, 1, 1, 0, 0, 0, 0).getTime());
    expect(period.end).toBe(
      new Date(2026, 1, 28, 23, 59, 59, 999).getTime()
    );
  });

  it('resolves contiguous start-day periods in short months', () => {
    const january = resolvePeriod({
      mode: 'start_day',
      year: 2026,
      month: 0,
      startDay: 31,
    });
    const february = resolvePeriod({
      mode: 'start_day',
      year: 2026,
      month: 1,
      startDay: 31,
    });

    expect(january.start).toBe(new Date(2026, 0, 31).getTime());
    expect(january.end).toBe(
      new Date(2026, 1, 27, 23, 59, 59, 999).getTime()
    );
    expect(february.start).toBe(new Date(2026, 1, 28).getTime());
    expect(february.start).toBe(january.end + 1);
  });

  it('resolves a cutoff period', () => {
    const period = resolvePeriod({
      mode: 'cutoff_day',
      year: 2026,
      month: 10,
      cutoffDay: 25,
    });
    expect(period.start).toBe(new Date(2026, 9, 26).getTime());
    expect(period.end).toBe(
      new Date(2026, 10, 25, 23, 59, 59, 999).getTime()
    );
  });

  it('rejects a custom range that ends before it starts', () => {
    expect(() =>
      resolvePeriod({
        mode: 'custom_range',
        year: 2026,
        month: 10,
        customStart: new Date(2026, 11, 10).getTime(),
        customEnd: new Date(2026, 11, 5).getTime(),
      })
    ).toThrow('PERIOD_INVALID');
  });
});

describe('periodForDate', () => {
  it('keeps dates on and after the start day in the current month', () => {
    const period = periodForDate({
      mode: 'start_day',
      date: new Date(2026, 9, 15, 12).getTime(),
      startDay: 15,
    });
    expect(period?.year).toBe(2026);
    expect(period?.month).toBe(9);
    expect(period?.start).toBe(new Date(2026, 9, 15).getTime());
    expect(period?.end).toBe(
      new Date(2026, 10, 14, 23, 59, 59, 999).getTime()
    );
  });

  it('moves dates before the start day to the previous period', () => {
    const period = periodForDate({
      mode: 'start_day',
      date: new Date(2026, 10, 10, 12).getTime(),
      startDay: 15,
    });
    expect(period?.year).toBe(2026);
    expect(period?.month).toBe(9);
    expect(period?.start).toBe(new Date(2026, 9, 15).getTime());
    expect(period?.end).toBe(
      new Date(2026, 10, 14, 23, 59, 59, 999).getTime()
    );
  });

  it('handles the last day before a clamped start day', () => {
    const before = periodForDate({
      mode: 'start_day',
      date: new Date(2026, 1, 27, 12).getTime(),
      startDay: 31,
    });
    const onStart = periodForDate({
      mode: 'start_day',
      date: new Date(2026, 1, 28, 12).getTime(),
      startDay: 31,
    });

    expect(before?.month).toBe(0);
    expect(before?.end).toBe(
      new Date(2026, 1, 27, 23, 59, 59, 999).getTime()
    );
    expect(onStart?.month).toBe(1);
    expect(onStart?.start).toBe(new Date(2026, 1, 28).getTime());
  });

  it('labels a cutoff period by the month where it ends', () => {
    const period = periodForDate({
      mode: 'cutoff_day',
      date: new Date(2026, 10, 20, 12).getTime(),
      cutoffDay: 25,
    });
    expect(period?.month).toBe(10);
    expect(period?.start).toBe(new Date(2026, 9, 26).getTime());
    expect(period?.end).toBe(
      new Date(2026, 10, 25, 23, 59, 59, 999).getTime()
    );
  });

  it('returns null for custom ranges', () => {
    expect(
      periodForDate({
        mode: 'custom_range',
        date: Date.now(),
      })
    ).toBeNull();
  });
});

describe('periodContains and nextPeriod', () => {
  it('is inclusive at both boundaries', () => {
    const period = resolvePeriod({
      mode: 'calendar_month',
      year: 2026,
      month: 10,
    });
    expect(periodContains(period, period.start)).toBe(true);
    expect(periodContains(period, period.end)).toBe(true);
    expect(periodContains(period, period.start - 1)).toBe(false);
    expect(periodContains(period, period.end + 1)).toBe(false);
  });

  it('returns the next contiguous period', () => {
    const period = resolvePeriod({
      mode: 'start_day',
      year: 2026,
      month: 9,
      startDay: 15,
    });
    const next = nextPeriod(period, { mode: 'start_day', startDay: 15 });
    expect(next?.start).toBe(period.end + 1);
    expect(next?.month).toBe(10);
  });

  it('derives the anchor month from the period mode', () => {
    const startDay = resolvePeriod({
      mode: 'start_day',
      year: 2026,
      month: 9,
      startDay: 15,
    });
    const cutoff = resolvePeriod({
      mode: 'cutoff_day',
      year: 2026,
      month: 10,
      cutoffDay: 25,
    });

    expect(anchorMonthForPeriod({ ...startDay, mode: 'start_day' })).toEqual({
      year: 2026,
      month: 9,
    });
    expect(anchorMonthForPeriod({ ...cutoff, mode: 'cutoff_day' })).toEqual({
      year: 2026,
      month: 10,
    });
  });
});

describe('resolveDayInPeriod', () => {
  it('picks the occurrence inside the period', () => {
    const period = resolvePeriod({
      mode: 'start_day',
      year: 2026,
      month: 9,
      startDay: 15,
    });

    expect(resolveDayInPeriod(period, 20)).toBe(
      new Date(2026, 9, 20, 12).getTime()
    );
    expect(resolveDayInPeriod(period, 5)).toBe(
      new Date(2026, 10, 5, 12).getTime()
    );
  });

  it('clamps the day to the last day of short months', () => {
    const period = resolvePeriod({
      mode: 'start_day',
      year: 2026,
      month: 0,
      startDay: 31,
    });
    expect(resolveDayInPeriod(period, 31)).toBe(
      new Date(2026, 0, 31, 12).getTime()
    );

    const february = resolvePeriod({
      mode: 'start_day',
      year: 2026,
      month: 1,
      startDay: 31,
    });
    expect(resolveDayInPeriod(february, 31)).toBe(
      new Date(2026, 1, 28, 12).getTime()
    );
    expect(resolveDayInPeriod(february, 30)).toBe(
      new Date(2026, 2, 30, 12).getTime()
    );
  });

  it('returns null for an invalid day', () => {
    const period = resolvePeriod({
      mode: 'calendar_month',
      year: 2026,
      month: 10,
    });
    expect(resolveDayInPeriod(period, 0)).toBeNull();
    expect(resolveDayInPeriod(period, null)).toBeNull();
  });
});
