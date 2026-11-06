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
    expect(chart).toContain('xychart-beta');
    expect(chart).toContain('bar [37.854, 37.854]');
    expect(buildVolumeChart(entries, 'gal', 'Volume')).toContain(
      'bar [10, 10]'
    );
  });

  it('builds a price chart by segment in the selected unit', () => {
    const chart = buildPriceChart(entries, 'gal', 'Price');
    expect(chart).toContain('line [4, 4.5]');
    expect(buildPriceChart(entries, 'L', 'Price')).toContain('line [1.057');
  });

  it('builds a total spend chart by segment', () => {
    const chart = buildTotalSpendChart(entries, 'gal', 'Total spent');
    expect(chart).toContain('bar [40, 45]');
    expect(chart).toContain('y-axis "$"');
  });

  it('compares volume, distance and total cost per segment', () => {
    const chart = buildMobilityComparisonChart(
      entries,
      'L',
      'mi',
      'Mobility'
    );
    expect(chart).toContain('Index (base 100)');
    expect(chart?.match(/line \[/g)).toHaveLength(3);
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
