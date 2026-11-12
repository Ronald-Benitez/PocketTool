import { computeRecordShares, splitSharedAmount } from '../split';

describe('splitSharedAmount', () => {
  it('splits a shared amount proportionally', () => {
    expect(
      splitSharedAmount(10000, [
        { personId: 1, sharePercent: 25 },
        { personId: 2, sharePercent: 25 },
      ])
    ).toEqual([
      { personId: 1, sharePercent: 25, amountCents: 5000 },
      { personId: 2, sharePercent: 25, amountCents: 5000 },
    ]);
  });

  it('always reconciles to the shared amount', () => {
    const splits = splitSharedAmount(10000, [
      { personId: 1, sharePercent: 33.33 },
      { personId: 2, sharePercent: 33.33 },
      { personId: 3, sharePercent: 33.34 },
    ]);
    expect(splits.reduce((total, split) => total + split.amountCents, 0)).toBe(
      10000
    );
  });

  it('ignores participants without a share', () => {
    expect(
      splitSharedAmount(900, [
        { personId: 1, sharePercent: 100 },
        { personId: 2, sharePercent: 0 },
      ])
    ).toEqual([{ personId: 1, sharePercent: 100, amountCents: 900 }]);
  });

  it('returns no allocations without shared amount or participants', () => {
    expect(splitSharedAmount(0, [{ personId: 1, sharePercent: 50 }])).toEqual(
      []
    );
    expect(splitSharedAmount(500, [])).toEqual([]);
    expect(
      splitSharedAmount(500, [{ personId: 1, sharePercent: 0 }])
    ).toEqual([]);
  });
});

describe('computeRecordShares', () => {
  it('splits the total into own and shared shares', () => {
    expect(
      computeRecordShares(10000, [{ personId: 1, sharePercent: 50 }])
    ).toEqual({ ownCents: 5000, sharedCents: 5000 });
  });

  it('clamps percentages above 100', () => {
    expect(
      computeRecordShares(10000, [
        { personId: 1, sharePercent: 80 },
        { personId: 2, sharePercent: 40 },
      ])
    ).toEqual({ ownCents: 0, sharedCents: 10000 });
  });

  it('keeps the own share when only part is shared', () => {
    expect(
      computeRecordShares(900, [{ personId: 1, sharePercent: 33.33 }])
    ).toEqual({ ownCents: 600, sharedCents: 300 });
  });

  it('handles zero and negative totals', () => {
    expect(computeRecordShares(0, [{ personId: 1, sharePercent: 50 }])).toEqual({
      ownCents: 0,
      sharedCents: 0,
    });
    expect(
      computeRecordShares(-100, [{ personId: 1, sharePercent: 50 }])
    ).toEqual({ ownCents: 0, sharedCents: 0 });
  });
});
