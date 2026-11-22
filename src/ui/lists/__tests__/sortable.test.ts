import { resolveDropIndex } from '../sortable';

const heights = [72, 72, 72, 72];

describe('resolveDropIndex', () => {
  it('keeps the same index without vertical movement', () => {
    expect(
      resolveDropIndex({ from: 1, translationY: 0, heights, count: 4 })
    ).toBe(1);
  });

  it('keeps the index before crossing half of the next row', () => {
    expect(
      resolveDropIndex({ from: 0, translationY: 20, heights, count: 4 })
    ).toBe(0);
  });

  it('moves down once the next row midpoint is crossed', () => {
    expect(
      resolveDropIndex({ from: 0, translationY: 40, heights, count: 4 })
    ).toBe(1);
    expect(
      resolveDropIndex({ from: 0, translationY: 150, heights, count: 4 })
    ).toBe(2);
  });

  it('moves up once the previous row midpoint is crossed', () => {
    expect(
      resolveDropIndex({ from: 2, translationY: -40, heights, count: 4 })
    ).toBe(1);
    expect(
      resolveDropIndex({ from: 3, translationY: -150, heights, count: 4 })
    ).toBe(1);
  });

  it('uses the estimated height for unmeasured rows', () => {
    expect(
      resolveDropIndex({
        from: 0,
        translationY: 40,
        heights: [],
        count: 3,
        estimatedHeight: 80,
      })
    ).toBe(0);
    expect(
      resolveDropIndex({
        from: 0,
        translationY: 41,
        heights: [],
        count: 3,
        estimatedHeight: 80,
      })
    ).toBe(1);
  });

  it('clamps invalid indexes to the list bounds', () => {
    expect(
      resolveDropIndex({ from: -1, translationY: 0, heights, count: 4 })
    ).toBe(0);
    expect(
      resolveDropIndex({ from: 9, translationY: 0, heights, count: 4 })
    ).toBe(3);
    expect(
      resolveDropIndex({ from: 0, translationY: 9999, heights, count: 4 })
    ).toBe(3);
  });
});
