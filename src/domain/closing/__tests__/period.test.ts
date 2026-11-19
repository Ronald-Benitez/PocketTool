import {
  isClosingEditable,
  resolveClosingPeriod,
} from '../period';

describe('resolveClosingPeriod', () => {
  it('resolves a calendar month with grace days', () => {
    const period = resolveClosingPeriod({
      mode: 'calendar_month',
      groupYear: 2026,
      groupMonth: 10, // November
      graceDays: 5,
    });

    expect(period.start).toBe(new Date(2026, 10, 1, 0, 0, 0, 0).getTime());
    expect(period.end).toBe(
      new Date(2026, 10, 30, 23, 59, 59, 999).getTime()
    );
    expect(period.editableUntil).toBe(
      new Date(2026, 11, 5, 23, 59, 59, 999).getTime()
    );
  });

  it('resolves a cutoff cycle', () => {
    const period = resolveClosingPeriod({
      mode: 'cutoff_day',
      groupYear: 2026,
      groupMonth: 10,
      cutoffDay: 25,
      graceDays: 0,
    });

    expect(period.start).toBe(new Date(2026, 9, 26, 0, 0, 0, 0).getTime());
    expect(period.end).toBe(
      new Date(2026, 10, 25, 23, 59, 59, 999).getTime()
    );
  });

  it('clamps the cutoff day to the last day of the month', () => {
    const period = resolveClosingPeriod({
      mode: 'cutoff_day',
      groupYear: 2026,
      groupMonth: 1, // February
      cutoffDay: 31,
      graceDays: 0,
    });

    expect(period.start).toBe(new Date(2026, 1, 1, 0, 0, 0, 0).getTime());
    expect(period.end).toBe(
      new Date(2026, 1, 28, 23, 59, 59, 999).getTime()
    );
  });

  it('resolves a period that starts on a day of the group month', () => {
    const period = resolveClosingPeriod({
      mode: 'start_day',
      groupYear: 2026,
      groupMonth: 9, // October
      startDay: 18,
      graceDays: 5,
    });

    expect(period.start).toBe(
      new Date(2026, 9, 18, 0, 0, 0, 0).getTime()
    );
    expect(period.end).toBe(
      new Date(2026, 10, 18, 23, 59, 59, 999).getTime()
    );
    expect(period.editableUntil).toBe(
      new Date(2026, 10, 23, 23, 59, 59, 999).getTime()
    );
  });

  it('clamps the start day in shorter months', () => {
    const period = resolveClosingPeriod({
      mode: 'start_day',
      groupYear: 2026,
      groupMonth: 0, // January
      startDay: 31,
      graceDays: 0,
    });

    expect(period.start).toBe(
      new Date(2026, 0, 31, 0, 0, 0, 0).getTime()
    );
    expect(period.end).toBe(
      new Date(2026, 1, 28, 23, 59, 59, 999).getTime()
    );
  });

  it('resolves a custom range and manual deadline', () => {
    const start = new Date(2026, 10, 20, 15, 30).getTime();
    const end = new Date(2026, 11, 19, 8, 0).getTime();
    const deadline = new Date(2026, 11, 24, 23, 59, 59, 999).getTime();

    const period = resolveClosingPeriod({
      mode: 'custom_range',
      groupYear: 2026,
      groupMonth: 10,
      graceDays: 3,
      customStart: start,
      customEnd: end,
      editableUntil: deadline,
    });

    expect(period.start).toBe(
      new Date(2026, 10, 20, 0, 0, 0, 0).getTime()
    );
    expect(period.end).toBe(
      new Date(2026, 11, 19, 23, 59, 59, 999).getTime()
    );
    expect(period.editableUntil).toBe(deadline);
  });

  it('allows a past group with a custom future range', () => {
    const period = resolveClosingPeriod({
      mode: 'custom_range',
      groupYear: 2020,
      groupMonth: 0,
      graceDays: 0,
      customStart: new Date(2030, 0, 10).getTime(),
      customEnd: new Date(2030, 1, 10).getTime(),
    });

    expect(
      isClosingEditable(period.editableUntil, new Date(2030, 0, 15).getTime())
    ).toBe(true);
    expect(
      isClosingEditable(period.editableUntil, new Date(2030, 1, 11).getTime())
    ).toBe(false);
  });

  it('rejects a custom range that ends before it starts', () => {
    expect(() =>
      resolveClosingPeriod({
        mode: 'custom_range',
        groupYear: 2026,
        groupMonth: 10,
        graceDays: 0,
        customStart: new Date(2026, 11, 10).getTime(),
        customEnd: new Date(2026, 11, 5).getTime(),
      })
    ).toThrow('CLOSING_INVALID_PERIOD');
  });

  it('rejects a deadline before the period end', () => {
    expect(() =>
      resolveClosingPeriod({
        mode: 'calendar_month',
        groupYear: 2026,
        groupMonth: 10,
        graceDays: 0,
        editableUntil: new Date(2026, 10, 10).getTime(),
      })
    ).toThrow('CLOSING_INVALID_PERIOD');
  });
});

describe('isClosingEditable', () => {
  it('is editable exactly at the deadline', () => {
    const deadline = new Date(2026, 10, 5, 23, 59, 59, 999).getTime();
    expect(isClosingEditable(deadline, deadline)).toBe(true);
    expect(isClosingEditable(deadline, deadline + 1)).toBe(false);
  });
});
