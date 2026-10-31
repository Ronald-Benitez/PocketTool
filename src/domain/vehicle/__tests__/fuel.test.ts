import {
  analyzeFuelEntries,
  buildFuelStats,
  groupFuelSegments,
} from '../fuel';

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

  it('groups partial fills under the full tank that completes the segment', () => {
    const entries = [
      { ...base, id: 1, date: 1, odometer: 1000, volume: 10, is_full_tank: 1 },
      { ...base, id: 2, date: 2, odometer: 1200, volume: 5, is_full_tank: 0 },
      { ...base, id: 3, date: 3, odometer: 1400, volume: 5, is_full_tank: 1 },
    ];
    const segments = groupFuelSegments(entries);

    expect(segments).toHaveLength(1);
    expect(segments[0].status).toBe('complete');
    expect(segments[0].startEntry.id).toBe(1);
    expect(segments[0].endEntry.id).toBe(3);
    expect(segments[0].entries.map((item) => item.entry.id)).toEqual([1, 2, 3]);
    expect(segments[0].metrics?.miPerGal).toBeCloseTo(40, 6);
  });

  it('changes segment boundaries when a partial fill becomes full', () => {
    const partialMiddle = [
      { ...base, id: 1, date: 1, odometer: 1000, volume: 10, is_full_tank: 1 },
      { ...base, id: 2, date: 2, odometer: 1200, volume: 5, is_full_tank: 1 },
      { ...base, id: 3, date: 3, odometer: 1400, volume: 5, is_full_tank: 1 },
    ];
    const segments = groupFuelSegments(partialMiddle);

    expect(segments).toHaveLength(2);
    expect(segments.map((segment) => segment.status)).toEqual([
      'complete',
      'complete',
    ]);
    expect(segments[0].entries.map((item) => item.entry.id)).toEqual([1, 2]);
    expect(segments[1].entries.map((item) => item.entry.id)).toEqual([3]);
  });

  it('calculates full-tank segments using manual distance without odometer', () => {
    const entries = [
      { ...base, id: 1, date: 1, volume: 10, is_full_tank: 1 },
      { ...base, id: 2, date: 2, volume: 5, is_full_tank: 0 },
      {
        ...base,
        id: 3,
        date: 3,
        volume: 5,
        distance_traveled: 300,
        is_full_tank: 1,
      },
    ];
    const analysis = analyzeFuelEntries(entries);
    expect(analysis[2].segmentStatus).toBe('complete');
    expect(analysis[2].segmentMetrics?.miPerGal).toBeCloseTo(30, 6);

    const segments = groupFuelSegments(entries);
    expect(segments).toHaveLength(1);
    expect(segments[0].metrics?.miPerGal).toBeCloseTo(30, 6);
  });

  it('shows consumption for every full tank that closes a cycle', () => {
    const entries = [
      { ...base, id: 1, date: 1, volume: 3.233, is_full_tank: 0 },
      { ...base, id: 2, date: 2, volume: 8.5399, is_full_tank: 1 },
      { ...base, id: 3, date: 3, volume: 3.112, is_full_tank: 0 },
      {
        ...base,
        id: 4,
        date: 4,
        volume: 7.984,
        distance_traveled: 344.7,
        is_full_tank: 1,
      },
      {
        ...base,
        id: 5,
        date: 5,
        volume: 8.539,
        distance_traveled: 255.8,
        is_full_tank: 1,
      },
      { ...base, id: 6, date: 6, volume: 3.1, is_full_tank: 0 },
      {
        ...base,
        id: 7,
        date: 7,
        volume: 7.938,
        distance_traveled: 316.3,
        is_full_tank: 1,
      },
    ];

    const segments = groupFuelSegments(entries);
    const completed = segments.filter(
      (segment) => segment.status === 'complete'
    );

    expect(completed).toHaveLength(3);
    expect(completed.every((segment) => segment.metrics != null)).toBe(true);

    const weekTwo = completed.find((segment) => segment.endEntry.id === 4);
    expect(weekTwo?.entries.map((item) => item.entry.id)).toEqual([2, 3, 4]);

    const weekThree = completed.find((segment) => segment.endEntry.id === 5);
    expect(weekThree?.entries.map((item) => item.entry.id)).toEqual([5]);
  });

  it('builds weighted stats', () => {
    const entries = [
      { ...base, id: 1, date: 1, odometer: 1000, volume: 10 },
      { ...base, id: 2, date: 2, odometer: 1300, volume: 10 },
    ];
    const stats = buildFuelStats(entries, 'mi_gal');
    expect(stats.totalVolumeL).toBeCloseTo(75.70823568, 6);
    expect(stats.averageMetrics?.miPerGal).toBeCloseTo(30, 6);
    expect(stats.best).not.toBeNull();
  });
});
