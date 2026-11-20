import {
  bandScale,
  categoryLabels,
  chartValueDomain,
  linearScale,
  niceTicks,
  valuesForCategories,
} from '../scale';
import type { ChartSpec } from '../types';

const spec: ChartSpec = {
  kind: 'grouped_bar',
  series: [
    {
      key: 'planned',
      label: 'Planned',
      tone: 'planned',
      points: [
        { x: 'Food', y: 100 },
        { x: 'Rent', y: 500 },
      ],
    },
    {
      key: 'actual',
      label: 'Actual',
      tone: 'actual',
      points: [
        { x: 'Food', y: 80 },
        { x: 'Rent', y: 520 },
      ],
    },
  ],
};

describe('chart scales', () => {
  it('includes zero in the value domain', () => {
    expect(chartValueDomain(spec.series)).toEqual([0, 520]);
    expect(chartValueDomain(spec.series, false)).toEqual([80, 520]);
  });

  it('handles empty and single-value series', () => {
    expect(chartValueDomain([])).toEqual([0, 1]);
    expect(
      chartValueDomain([
        { key: 'one', label: 'One', tone: 'primary', points: [{ x: 1, y: 5 }] },
      ])
    ).toEqual([0, 5]);
  });

  it('builds nice ticks and a linear scale', () => {
    const ticks = niceTicks(0, 520, 4);
    expect(ticks.min).toBe(0);
    expect(ticks.max).toBeGreaterThanOrEqual(520);
    expect(ticks.ticks.length).toBeGreaterThan(2);
    const scale = linearScale([0, 100], [0, 200]);
    expect(scale.value(0)).toBe(0);
    expect(scale.value(50)).toBe(100);
    expect(scale.value(100)).toBe(200);
  });

  it('builds band positions and aligned values', () => {
    const categories = categoryLabels(spec);
    expect(categories).toEqual(['Food', 'Rent']);
    const band = bandScale(categories.length, 0, 100);
    expect(band.center(1)).toBeGreaterThan(band.center(0));
    expect(valuesForCategories(spec.series[0], categories)).toEqual([100, 500]);
    expect(valuesForCategories(spec.series[1], categories)).toEqual([80, 520]);
  });
});
