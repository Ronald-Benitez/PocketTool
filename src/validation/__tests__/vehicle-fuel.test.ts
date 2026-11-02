import { vehicleFuelEntryInputSchema } from '../entities';

const base = {
  vehicle_id: 1,
  date: Date.now(),
  distance_unit: 'mi' as const,
  volume_unit: 'gal' as const,
  odometer: 1000,
  volume: 10,
  price_per_unit: 350,
  total_cost: 3500,
  is_full_tank: 1,
};

describe('vehicle fuel validation', () => {
  it('accepts an odometer-only baseline', () => {
    const parsed = vehicleFuelEntryInputSchema.parse({
      vehicle_id: 1,
      date: Date.now(),
      distance_unit: 'mi',
      volume_unit: 'gal',
      odometer: 1000,
      volume: null,
      price_per_unit: null,
      total_cost: null,
      is_full_tank: 0,
      is_baseline: 1,
    });

    expect(parsed.is_baseline).toBe(1);
    expect(parsed.volume).toBeNull();
  });

  it('rejects a baseline without odometer', () => {
    expect(() =>
      vehicleFuelEntryInputSchema.parse({
        vehicle_id: 1,
        date: Date.now(),
        distance_unit: 'mi',
        volume_unit: 'gal',
        is_baseline: 1,
        volume: null,
        price_per_unit: null,
        total_cost: null,
      })
    ).toThrow();
  });

  it('allows a partial fill without odometer or distance', () => {
    expect(() =>
      vehicleFuelEntryInputSchema.parse({
        ...base,
        odometer: null,
        distance_traveled: null,
        is_full_tank: 0,
      })
    ).not.toThrow();
  });

  it('requires odometer or distance for a full tank', () => {
    expect(() =>
      vehicleFuelEntryInputSchema.parse({
        ...base,
        odometer: null,
        distance_traveled: null,
        is_full_tank: 1,
      })
    ).toThrow();
  });
});
