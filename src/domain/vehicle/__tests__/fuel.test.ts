import { analyzeFuelEntries, buildFuelStats } from '../fuel';

const base = {
  vehicle_id: 1,
  distance_unit: 'mi',
  volume_unit: 'gal',
  price_per_unit: 350,
  total_cost: 3500,
  is_full_tank: 1,
};

describe('vehicle fuel analysis', () => {
  it('calculates distance from odometer and consumption', () => {
    const entries = [
      { ...base, id: 1, date: 1, odometer: 1000, volume: 10 },
      { ...base, id: 2, date: 2, odometer: 1300, volume: 10 },
    ];
    const analysis = analyzeFuelEntries(entries);
    expect(analysis[1].distanceKm).toBeCloseTo(300 * 1.609344, 6);
    expect(analysis[1].metrics?.miPerGal).toBeCloseTo(30, 6);
    expect(analysis[1].segmentStatus).toBe('complete');
  });

  it('accumulates partial fills until the next full tank', () => {
    const entries = [
      { ...base, id: 1, date: 1, odometer: 1000, volume: 10, is_full_tank: 1 },
      { ...base, id: 2, date: 2, odometer: 1200, volume: 5, is_full_tank: 0 },
      { ...base, id: 3, date: 3, odometer: 1400, volume: 5, is_full_tank: 1 },
    ];
    const analysis = analyzeFuelEntries(entries);
    expect(analysis[1].segmentStatus).toBe('accumulating');
    expect(analysis[2].segmentStatus).toBe('complete');
    expect(analysis[2].segmentMetrics?.miPerGal).toBeCloseTo(40, 6);
  });

  it('builds weighted stats', () => {
    const entries = [
      { ...base, id: 1, date: 1, odometer: 1000, volume: 10 },
      { ...base, id: 2, date: 2, odometer: 1300, volume: 10 },
    ];
    const stats = buildFuelStats(entries, 'mi_gal');
    expect(stats.totalVolumeL).toBeCloseTo(75.70823568, 6);
    expect(stats.averageMetrics?.miPerGal).toBeCloseTo(15, 6);
    expect(stats.best).not.toBeNull();
  });
});
