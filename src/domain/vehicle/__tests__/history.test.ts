import { buildFuelHistory, buildMaintenanceHistory } from '../history';

const base = {
  vehicle_id: 1,
  distance_unit: 'mi',
  volume_unit: 'gal',
  price_per_unit: 350,
  total_cost: 3500,
  is_full_tank: 1,
};

const groups = [
  { id: 1, group_name: 'January', year: 2026, month: 0 },
  { id: 2, group_name: 'February', year: 2026, month: 1 },
];

describe('vehicle history', () => {
  it('groups fuel entries by calendar month', () => {
    const entries = [
      {
        ...base,
        id: 1,
        date: new Date(2026, 0, 5).getTime(),
        odometer: 1000,
        volume: 10,
        record_group_id: 1,
      },
      {
        ...base,
        id: 2,
        date: new Date(2026, 0, 20).getTime(),
        odometer: 1300,
        volume: 10,
        record_group_id: 1,
      },
      {
        ...base,
        id: 3,
        date: new Date(2026, 1, 5).getTime(),
        odometer: 1600,
        volume: 10,
        record_group_id: 2,
      },
    ];

    const history = buildFuelHistory(entries, 'calendar', groups, 'No group');
    expect(history).toHaveLength(2);
    expect(history[0].key).toBe('calendar-2026-0');
    expect(history[0].totalCostCents).toBe(7000);
    expect(history[0].distanceKm).toBeCloseTo(300 * 1.609344, 6);
    expect(history[0].averageMetrics?.miPerGal).toBeCloseTo(30, 6);
    expect(history[1].key).toBe('calendar-2026-1');
  });

  it('groups fuel entries by records group', () => {
    const entries = [
      {
        ...base,
        id: 1,
        date: new Date(2026, 0, 5).getTime(),
        volume: 10,
        record_group_id: 1,
      },
      {
        ...base,
        id: 2,
        date: new Date(2026, 0, 20).getTime(),
        volume: 10,
        record_group_id: null,
      },
    ];

    const history = buildFuelHistory(entries, 'group', groups, 'No group');
    expect(history).toHaveLength(2);
    expect(history[0].label).toBe('No group');
    expect(history[0].sort).toBe(-1);
    expect(history[1].label).toBe('January');
  });

  it('groups maintenance costs by calendar month', () => {
    const history = buildMaintenanceHistory(
      [
        {
          date: new Date(2026, 0, 10).getTime(),
          distance_unit: 'mi',
          service_type: 'oil_change',
          title: 'Oil',
          cost: 5000,
          record_group_id: 1,
        },
        {
          date: new Date(2026, 0, 15).getTime(),
          distance_unit: 'mi',
          service_type: 'tires',
          title: 'Tires',
          cost: 20000,
          record_group_id: 1,
        },
      ],
      'calendar',
      groups,
      'No group'
    );

    expect(history).toHaveLength(1);
    expect(history[0].totalCostCents).toBe(25000);
    expect(history[0].entries).toBe(2);
  });
});
