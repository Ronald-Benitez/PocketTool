import {
  calculateRecordBalance,
  getEffectMap,
  getSpendingTypeIds,
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

  it('excludes payment and transfer types from spending ids', () => {
    const ids = getSpendingTypeIds(recordTypes, [3]);

    expect([...ids].sort()).toEqual([1, 2]);
  });
});
