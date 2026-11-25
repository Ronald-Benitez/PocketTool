import {
  applyEffectSign,
  calculateRecordBalance,
  getEffectMap,
  getSpendingTypeIds,
  sumWithEffect,
} from '../aggregate';

describe('summary aggregation', () => {
  const recordTypes = [
    { id: 1, effect: '+' },
    { id: 2, effect: '-' },
    { id: 3, effect: '-' },
    { id: 4, effect: '=' },
  ];

  it('calculates balances with the same effect rules used by summaries', () => {
    const balance = calculateRecordBalance(
      [
        { amount: 1000, record_type_id: 1 },
        { amount: 250, record_type_id: 2 },
        { amount: 100, record_type_id: 4 },
      ],
      getEffectMap(recordTypes),
      new Set([1, 2])
    );

    expect(balance).toBe(750);
  });

  it('applies the record type effect to a group total', () => {
    expect(applyEffectSign('+', 1000)).toBe(1000);
    expect(applyEffectSign('-', 250)).toBe(-250);
    expect(applyEffectSign('=', 100)).toBe(0);
    expect(applyEffectSign(null, 100)).toBe(0);
  });

  it('subtracts expenses from income in a mixed group', () => {
    expect(
      sumWithEffect([
        { effect: '+', amount: 1000 },
        { effect: '-', amount: 250 },
        { effect: '=', amount: 500 },
      ])
    ).toBe(750);
  });

  it('excludes payment and transfer types from spending ids', () => {
    const ids = getSpendingTypeIds(recordTypes, [3]);

    expect([...ids].sort()).toEqual([1, 2]);
  });
});
