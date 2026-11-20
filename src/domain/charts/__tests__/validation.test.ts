import { validateChartSpec } from '../validation';
import type { ChartSpec } from '../types';

const valid: ChartSpec = {
  kind: 'line',
  series: [
    {
      key: 'a',
      label: 'A',
      tone: 'primary',
      points: [{ x: 1, y: 10 }],
    },
  ],
};

describe('chart spec validation', () => {
  it('accepts a valid spec', () => {
    expect(validateChartSpec(valid)).toEqual([]);
  });

  it('rejects empty series', () => {
    expect(validateChartSpec({ ...valid, series: [] }).length).toBeGreaterThan(0);
  });

  it('rejects non-finite values', () => {
    expect(
      validateChartSpec({
        ...valid,
        series: [
          {
            ...valid.series[0],
            points: [{ x: 1, y: Number.NaN }],
          },
        ],
      }).length
    ).toBeGreaterThan(0);
  });

  it('rejects negative pie values', () => {
    expect(
      validateChartSpec({
        kind: 'pie',
        series: [
          {
            ...valid.series[0],
            points: [{ x: 'A', y: -1 }],
          },
        ],
      }).length
    ).toBeGreaterThan(0);
  });
});
