import { buildReminderStatus, latestOdometerKm } from '../reminders';

const baseReminder = {
  service_type: 'oil_change',
  title: 'Oil',
  interval_distance: 5000,
  interval_distance_unit: 'mi',
  interval_months: 6,
  last_service_date: Date.now() - 1000 * 60 * 60 * 24 * 30,
  last_service_odometer: 10000,
  odometer_unit: 'mi',
  is_active: 1,
};

describe('vehicle reminders', () => {
  it('uses the latest odometer from fuel or maintenance', () => {
    const value = latestOdometerKm(
      [{ vehicle_id: 1, date: 2, odometer: 2000, distance_unit: 'mi', volume: 1, volume_unit: 'gal', price_per_unit: 1, total_cost: 1 }],
      [{ date: 1, odometer: 3000, distance_unit: 'mi', service_type: 'oil_change', title: 'Oil', cost: 0 }]
    );
    expect(value).toBeCloseTo(2000 * 1.609344, 6);
  });

  it('marks a reminder due soon or overdue', () => {
    const dueSoon = buildReminderStatus(
      { ...baseReminder, last_service_odometer: 10000 },
      (10000 + 4800) * 1.609344
    );
    expect(dueSoon.status).toBe('due_soon');

    const overdue = buildReminderStatus(
      { ...baseReminder, last_service_odometer: 10000 },
      (10000 + 6000) * 1.609344
    );
    expect(overdue.status).toBe('overdue');
  });
});
