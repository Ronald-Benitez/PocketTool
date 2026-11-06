import {
  buildFuelMetrics,
  calculateThirdValue,
  convertDistance,
  convertVolume,
  selectConsumption,
} from '../units';

describe('vehicle units', () => {
  it('converts distance and volume', () => {
    expect(convertDistance(1, 'mi', 'km')).toBeCloseTo(1.609344, 6);
    expect(convertVolume(1, 'gal', 'L')).toBeCloseTo(3.785411784, 6);
  });

  it('calculates the third value', () => {
    expect(calculateThirdValue({ mode: 'total', volume: 10, pricePerUnit: 350 })).toBe(3500);
    expect(calculateThirdValue({ mode: 'price', volume: 8, total: 3200 })).toBe(400);
    expect(calculateThirdValue({ mode: 'volume', pricePerUnit: 400, total: 3200 })).toBe(8);
  });

  it('returns all consumption formats', () => {
    const metrics = buildFuelMetrics({ distanceKm: 100, volumeL: 10, totalCost: 2000 });
    expect(metrics).not.toBeNull();
    expect(metrics?.kmPerL).toBeCloseTo(10, 6);
    expect(metrics?.lPer100km).toBeCloseTo(10, 6);
    expect(selectConsumption(metrics, 'km_l')).toBeCloseTo(10, 6);
    expect(selectConsumption(metrics, 'l_100km')).toBeCloseTo(10, 6);
    expect(selectConsumption(metrics, 'gal_60mi')).not.toBeNull();
  });
});
