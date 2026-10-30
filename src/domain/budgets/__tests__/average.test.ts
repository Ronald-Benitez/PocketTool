import { averageBudgetTotals } from '../average';

describe('averageBudgetTotals', () => {
  it('averages a category across all selected groups, including empty months', () => {
    const result = averageBudgetTotals(
      [
        { amount: 10000, category_id: 1, record_type_id: 2 },
        { amount: 20000, category_id: 1, record_type_id: 2 },
        { amount: 30000, category_id: 2, record_type_id: 2 },
      ],
      new Set([2]),
      2
    );

    expect(result).toEqual(
      expect.arrayContaining([
        { categoryId: 1, typeId: 2, amountCents: 15000 },
        { categoryId: 2, typeId: 2, amountCents: 15000 },
      ])
    );
  });

  it('ignores non-budgetable types and invalid rows', () => {
    const result = averageBudgetTotals(
      [
        { amount: 10000, category_id: 1, record_type_id: 3 },
        { amount: 0, category_id: 1, record_type_id: 2 },
        { amount: 5000, category_id: null, record_type_id: 2 },
      ],
      new Set([2]),
      4
    );

    expect(result).toEqual([]);
  });
});
