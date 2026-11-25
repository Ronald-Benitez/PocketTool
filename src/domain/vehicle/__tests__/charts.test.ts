import {
  buildMobilityComparisonChart,
  buildPriceChart,
  buildTotalSpendChart,
  buildVolumeChart,
} from '../charts';
import { analyzeFuelEntries } from '../fuel';

const base = {
  vehicle_id: 1,
  distance_unit: 'mi',
  volume_unit: 'gal',
  is_full_tank: 1,
};

const entries = analyzeFuelEntries([
  { ...base, id: 1, date: 1, odometer: 1000, volume: 10, price_per_unit: 350, total_cost: 3500 },
  { ...base, id: 2, date: 2, odometer: 1300, volume: 10, price_per_unit: 400, total_cost: 4000 },
  { ...base, id: 3, date: 3, odometer: 1600, volume: 10, price_per_unit: 450, total_cost: 4500 },
]);

describe('vehicle fuel charts', () => {
  it('builds a volume chart by segment in the selected unit', () => {
    const chart = buildVolumeChart(entries, 'L', 'Volume');
    expect(chart?.kind).toBe('bar');
    expect(chart?.series[0].points.map((point) => point.y)).toEqual([
      37.854,
      37.854,
    ]);
    expect(buildVolumeChart(entries, 'gal', 'Volume')?.series[0].points.map((point) => point.y)).toEqual([
      10,
      10,
    ]);
  });

  it('builds a price chart by segment in the selected unit', () => {
    const chart = buildPriceChart(entries, 'gal', 'Price');
    expect(chart?.kind).toBe('line');
    expect(chart?.yAxis?.format).toBe('currency');
    expect(chart?.series[0].points.map((point) => point.y)).toEqual([400, 450]);
    expect(
      buildPriceChart(entries, 'L', 'Price')?.series[0].points[0].y
    ).toBe(106);
  });

  it('builds a total spend chart by segment in cents', () => {
    const chart = buildTotalSpendChart(entries, 'gal', 'Total spent');
    expect(chart?.kind).toBe('bar');
    expect(chart?.yAxis?.format).toBe('money');
    expect(chart?.series[0].points.map((point) => point.y)).toEqual([
      4000, 4500,
    ]);
  });

  it('compares volume, distance and total cost per segment', () => {
    const chart = buildMobilityComparisonChart(
      entries,
      'L',
      'mi',
      'Mobility'
    );
    expect(chart?.kind).toBe('line');
    expect(chart?.yAxis?.format).toBe('index');
    expect(chart?.series).toHaveLength(3);
    expect(chart?.series[0].points[0].tooltipValue).toBe(37.854);
    expect(chart?.series[0].points[0].tooltipFormat).toBe('unit');
    expect(chart?.series[1].points[0].tooltipValue).toBe(300);
    expect(chart?.series[2].points[0].tooltipValue).toBe(40);
    expect(chart?.series[2].points[0].tooltipFormat).toBe('currency_units');
  });

  it('can plot raw mobility values without the base-100 index', () => {
    const chart = buildMobilityComparisonChart(
      entries,
      'L',
      'mi',
      'Mobility',
      { volume: 'Volume', distance: 'Distance', total: 'Total' },
      'real'
    );
    expect(chart?.yAxis?.format).toBe('number');
    expect(chart?.series[0].points[0].y).toBe(37.854);
    expect(chart?.series[1].points[0].y).toBe(300);
    expect(chart?.series[2].points[0].y).toBe(40);
  });

  it('requires at least two segments', () => {
    expect(buildVolumeChart(entries.slice(0, 2), 'L', 'Volume')).toBeNull();
    expect(buildPriceChart(entries.slice(0, 2), 'L', 'Price')).toBeNull();
    expect(
      buildTotalSpendChart(entries.slice(0, 2), 'L', 'Total')
    ).toBeNull();
    expect(
      buildMobilityComparisonChart(entries.slice(0, 2), 'L', 'mi', 'Mobility')
    ).toBeNull();
  });
});
