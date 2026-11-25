import { calculateShoppingTotal } from '../totals';

describe('calculateShoppingTotal', () => {
  it('sums only checked items with a price', () => {
    const result = calculateShoppingTotal([
      { priceCents: 250, isChecked: true },
      { priceCents: 100, isChecked: false },
      { priceCents: 75, isChecked: true },
      { priceCents: null, isChecked: false },
    ]);

    expect(result).toEqual({
      totalCents: 325,
      checkedCount: 2,
      pricedCheckedCount: 2,
      unpricedCheckedCount: 0,
      isPartial: false,
    });
  });

  it('marks the total as partial when a checked item has no price', () => {
    const result = calculateShoppingTotal([
      { priceCents: 250, isChecked: true },
      { priceCents: null, isChecked: true },
    ]);

    expect(result.totalCents).toBe(250);
    expect(result.unpricedCheckedCount).toBe(1);
    expect(result.isPartial).toBe(true);
  });

  it('returns zero when nothing is checked', () => {
    const result = calculateShoppingTotal([
      { priceCents: 250, isChecked: false },
      { priceCents: 100, isChecked: false },
    ]);

    expect(result.totalCents).toBe(0);
    expect(result.checkedCount).toBe(0);
    expect(result.isPartial).toBe(false);
  });

  it('treats zero, negative and invalid prices as no price', () => {
    const result = calculateShoppingTotal([
      { priceCents: 0, isChecked: true },
      { priceCents: -50, isChecked: true },
      { priceCents: Number.NaN, isChecked: true },
    ]);

    expect(result.totalCents).toBe(0);
    expect(result.pricedCheckedCount).toBe(0);
    expect(result.unpricedCheckedCount).toBe(3);
    expect(result.isPartial).toBe(true);
  });
});
