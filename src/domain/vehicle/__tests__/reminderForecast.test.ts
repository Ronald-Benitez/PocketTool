import {
  forecastVehicleRemindersInPeriod,
  type VehicleReminderForecastMaintenance,
  type VehicleReminderForecastReminder,
} from '../reminderForecast';
import type { Period } from '../../periods/types';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date(2026, 9, 15).getTime();
const period: Period = {
  start: new Date(2026, 9, 1).getTime(),
  end: new Date(2026, 9, 31, 23, 59, 59, 999).getTime(),
};

const fuelEntries = [
  {
    vehicle_id: 1,
    date: now - 30 * DAY,
    odometer: 10000,
    distance_unit: 'km',
    volume_unit: 'L',
  },
  {
    vehicle_id: 1,
    date: now - 2 * DAY,
    odometer: 14000,
    distance_unit: 'km',
    volume_unit: 'L',
  },
];

const maintenance: VehicleReminderForecastMaintenance[] = [
  {
    id: 1,
    vehicle_id: 1,
    date: now - 60 * DAY,
    service_type: 'oil_change',
    title: 'Oil change',
    cost: 10000,
    distance_unit: 'km',
  },
  {
    id: 2,
    vehicle_id: 1,
    date: now - 90 * DAY,
    service_type: 'oil_change',
    title: 'Oil change',
    cost: 20000,
    distance_unit: 'km',
  },
];

const reminder = (
  overrides: Partial<VehicleReminderForecastReminder>
): VehicleReminderForecastReminder => ({
  id: 1,
  vehicle_id: 1,
  service_type: 'oil_change',
  title: 'Oil change',
  is_active: 1,
  ...overrides,
});

describe('vehicle reminder forecast', () => {
  it('includes an active date-based reminder and estimates its cost', () => {
    const forecast = forecastVehicleRemindersInPeriod({
      reminders: [
        reminder({
          next_due_date: new Date(2026, 9, 20).getTime(),
        }),
      ],
      fuelEntries,
      maintenance,
      period,
      now,
    });

    expect(forecast[0].status).toBe('included');
    expect(forecast[0].reason).toBe('date');
    expect(forecast[0].amountCents).toBe(15000);
    expect(forecast[0].hasCostEstimate).toBe(true);
  });

  it('excludes inactive, deleted, completed and replaced reminders', () => {
    const forecast = forecastVehicleRemindersInPeriod({
      reminders: [
        reminder({ id: 1, is_active: 0 }),
        reminder({ id: 2, deleted_at: 1 }),
        reminder({
          id: 3,
          service_type: 'tires',
          last_service_date: new Date(2026, 9, 1).getTime(),
          next_due_date: new Date(2026, 9, 20).getTime(),
        }),
        reminder({
          id: 4,
          service_type: 'brakes',
          last_service_date: new Date(2026, 9, 1).getTime(),
          next_due_date: new Date(2026, 9, 25).getTime(),
        }),
        reminder({
          id: 5,
          service_type: 'brakes',
          last_service_date: new Date(2026, 9, 5).getTime(),
          next_due_date: new Date(2026, 9, 25).getTime(),
        }),
      ],
      fuelEntries,
      maintenance: [
        ...maintenance,
        {
          id: 3,
          vehicle_id: 1,
          date: new Date(2026, 9, 10).getTime(),
          service_type: 'tires',
          title: 'Tires',
          cost: 9000,
          distance_unit: 'km',
        },
      ],
      period,
      now,
    });

    const byId = new Map(forecast.map((item) => [item.reminderId, item]));
    expect(byId.get(1)?.reason).toBe('inactive');
    expect(byId.get(2)?.reason).toBe('deleted');
    expect(byId.get(3)?.reason).toBe('completed');
    expect(byId.get(4)?.reason).toBe('replaced');
  });

  it('does not treat a renewed reminder as completed', () => {
    const forecast = forecastVehicleRemindersInPeriod({
      reminders: [
        reminder({
          last_service_date: new Date(2026, 9, 10).getTime(),
          next_due_date: new Date(2026, 10, 10).getTime(),
        }),
      ],
      fuelEntries,
      maintenance: [
        ...maintenance,
        {
          id: 3,
          vehicle_id: 1,
          date: new Date(2026, 9, 10).getTime(),
          service_type: 'oil_change',
          title: 'Oil change',
          cost: 9000,
          distance_unit: 'km',
        },
      ],
      period,
      now,
    });

    expect(forecast[0].status).toBe('excluded');
    expect(forecast[0].reason).toBe('out_of_period');
  });

  it('includes an odometer-based reminder before the period ends', () => {
    const forecast = forecastVehicleRemindersInPeriod({
      reminders: [
        reminder({
          last_service_date: new Date(2026, 8, 1).getTime(),
          last_service_odometer: 10000,
          interval_distance: 5000,
          interval_distance_unit: 'km',
          odometer_unit: 'km',
        }),
      ],
      fuelEntries,
      maintenance,
      period,
      now,
    });

    expect(forecast[0].status).toBe('included');
    expect(forecast[0].reason).toBe('odometer');
    expect(forecast[0].projectedOdometerKm).toBeGreaterThan(15000);
  });

  it('excludes reminders without date or odometer data', () => {
    const forecast = forecastVehicleRemindersInPeriod({
      reminders: [reminder({})],
      fuelEntries,
      maintenance,
      period,
      now,
    });

    expect(forecast[0].status).toBe('excluded');
    expect(forecast[0].reason).toBe('no_data');
  });

  it('marks older active duplicates as replaced', () => {
    const forecast = forecastVehicleRemindersInPeriod({
      reminders: [
        reminder({ id: 1, last_service_date: new Date(2026, 8, 1).getTime() }),
        reminder({ id: 2, last_service_date: new Date(2026, 9, 1).getTime() }),
      ],
      fuelEntries,
      maintenance,
      period,
      now,
    });

    const byId = new Map(forecast.map((item) => [item.reminderId, item]));
    expect(byId.get(1)?.reason).toBe('replaced');
  });
});
