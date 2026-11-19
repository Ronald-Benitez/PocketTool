import {
  isFixedPendingPaid,
  resolvePendingFixedDate,
} from '../fixedPending';

describe('resolvePendingFixedDate', () => {
  const now = new Date(2026, 10, 25, 10, 30).getTime(); // Nov 25, 2026

  it('uses the fixed day inside the selected group month', () => {
    expect(
      resolvePendingFixedDate({
        mode: 'group_month',
        now,
        fixedDay: 20,
        groupYear: 2026,
        groupMonth: 10, // November, zero-based
      })
    ).toBe(new Date(2026, 10, 20, 12, 0, 0, 0).getTime());
  });

  it('clamps the group month day to its last day', () => {
    expect(
      resolvePendingFixedDate({
        mode: 'group_month',
        now,
        fixedDay: 31,
        groupYear: 2026,
        groupMonth: 1, // February
      })
    ).toBe(new Date(2026, 1, 28, 12, 0, 0, 0).getTime());
  });

  it('falls back to the current month without a group', () => {
    expect(
      resolvePendingFixedDate({
        mode: 'group_month',
        now,
        fixedDay: 20,
      })
    ).toBe(new Date(2026, 10, 20, 12, 0, 0, 0).getTime());
  });

  it('uses the next occurrence from today and ignores the group month', () => {
    const result = resolvePendingFixedDate({
      mode: 'next_occurrence',
      now,
      fixedDay: 20,
      groupYear: 2026,
      groupMonth: 10,
    });
    expect(result).toBe(new Date(2026, 11, 20, 12, 0, 0, 0).getTime());

    expect(
      resolvePendingFixedDate({
        mode: 'next_occurrence',
        now,
        fixedDay: 20,
        groupYear: 2020,
        groupMonth: 0,
      })
    ).toBe(result);
  });

  it('keeps today when the fixed day is today', () => {
    expect(
      resolvePendingFixedDate({
        mode: 'next_occurrence',
        now,
        fixedDay: 25,
      })
    ).toBe(new Date(2026, 10, 25, 12, 0, 0, 0).getTime());
  });

  it('falls back to now without a fixed day', () => {
    expect(
      resolvePendingFixedDate({
        mode: 'group_month',
        now,
        fixedDay: null,
      })
    ).toBe(now);
    expect(
      resolvePendingFixedDate({
        mode: 'next_occurrence',
        now,
        fixedDay: 0,
      })
    ).toBe(now);
  });
});

describe('isFixedPendingPaid', () => {
  const records = [
    { fixed_id: 7, date: new Date(2026, 10, 5).getTime(), group_id: 1 },
    { fixed_id: 7, date: new Date(2026, 11, 5).getTime(), group_id: 1 },
    { fixed_id: 8, date: new Date(2026, 10, 10).getTime(), group_id: 2 },
  ];
  const targetDate = new Date(2026, 11, 20, 12).getTime(); // December 20

  it('uses only the selected group in group mode', () => {
    expect(
      isFixedPendingPaid({
        mode: 'group',
        fixedId: 7,
        targetDate,
        groupId: 1,
        records,
      })
    ).toBe(true);

    expect(
      isFixedPendingPaid({
        mode: 'group',
        fixedId: 7,
        targetDate,
        groupId: 2,
        records,
      })
    ).toBe(false);
  });

  it('uses the target month across groups in period mode', () => {
    expect(
      isFixedPendingPaid({
        mode: 'period',
        fixedId: 7,
        targetDate,
        groupId: 2,
        records,
      })
    ).toBe(true);
  });

  it('does not mark paid for a record outside the target month', () => {
    expect(
      isFixedPendingPaid({
        mode: 'period',
        fixedId: 7,
        targetDate: new Date(2026, 9, 20, 12).getTime(),
        groupId: 1,
        records,
      })
    ).toBe(false);
  });

  it('ignores records from another fixed', () => {
    expect(
      isFixedPendingPaid({
        mode: 'period',
        fixedId: 9,
        targetDate,
        groupId: 1,
        records,
      })
    ).toBe(false);
  });
});
