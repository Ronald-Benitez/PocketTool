import type {
  FuelEntryLike,
  ReminderLike,
  ReminderStatus,
  VehicleMaintenanceLike,
} from './types';
import { convertDistance, distanceUnitOf, toKm } from './units';

export const latestOdometerKm = (
  fuelEntries: FuelEntryLike[],
  maintenance: VehicleMaintenanceLike[],
  fallbackDate?: number
) => {
  const values: { date: number; km: number }[] = [];

  for (const entry of fuelEntries) {
    if (entry.odometer == null) continue;
    values.push({
      date: entry.date,
      km: toKm(entry.odometer, distanceUnitOf(entry.distance_unit)),
    });
  }
  for (const entry of maintenance) {
    if (entry.odometer == null) continue;
    values.push({
      date: entry.date,
      km: toKm(entry.odometer, distanceUnitOf(entry.distance_unit)),
    });
  }

  if (values.length === 0) return null;
  values.sort((a, b) => b.date - a.date || b.km - a.km);
  if (fallbackDate != null) {
    const before = values.find((item) => item.date <= fallbackDate);
    if (before) return before.km;
  }
  return values[0].km;
};

export const buildReminderStatus = (
  reminder: ReminderLike,
  currentOdometerKm: number | null,
  today = Date.now()
): ReminderStatus => {
  const intervalMonths = reminder.interval_months ?? null;
  let remainingDays: number | null = null;

  if (reminder.next_due_date != null) {
    const end = new Date(reminder.next_due_date);
    end.setHours(23, 59, 59, 999);
    remainingDays = Math.ceil((end.getTime() - today) / 86400000);
  } else if (reminder.last_service_date != null && intervalMonths != null) {
    const next = new Date(reminder.last_service_date);
    next.setMonth(next.getMonth() + intervalMonths);
    remainingDays = Math.ceil((next.getTime() - today) / 86400000);
  }

  let remainingDistance: number | null = null;
  if (
    currentOdometerKm != null &&
    reminder.last_service_odometer != null &&
    reminder.interval_distance != null
  ) {
    const unit = distanceUnitOf(reminder.odometer_unit);
    const intervalKm = toKm(
      reminder.interval_distance,
      distanceUnitOf(reminder.interval_distance_unit)
    );
    const lastKm = toKm(reminder.last_service_odometer, unit);
    const dueKm = lastKm + intervalKm;
    remainingDistance = convertDistance(
      dueKm - currentOdometerKm,
      'km',
      unit
    );
  } else if (
    currentOdometerKm != null &&
    reminder.next_due_odometer != null
  ) {
    const unit = distanceUnitOf(reminder.odometer_unit);
    remainingDistance = convertDistance(
      toKm(reminder.next_due_odometer, unit) - currentOdometerKm,
      'km',
      unit
    );
  }

  if (remainingDistance == null && remainingDays == null) {
    return { remainingDistance, remainingDays, status: 'no_data' };
  }
  if (
    (remainingDistance != null && remainingDistance <= 0) ||
    (remainingDays != null && remainingDays <= 0)
  ) {
    return { remainingDistance, remainingDays, status: 'overdue' };
  }

  const intervalInOdometerUnit =
    reminder.interval_distance != null
      ? convertDistance(
          reminder.interval_distance,
          distanceUnitOf(reminder.interval_distance_unit),
          distanceUnitOf(reminder.odometer_unit)
        )
      : null;
  const distanceSoon =
    remainingDistance != null &&
    intervalInOdometerUnit != null &&
    remainingDistance <= intervalInOdometerUnit * 0.1;
  const daysSoon = remainingDays != null && remainingDays <= 30;

  return {
    remainingDistance,
    remainingDays,
    status: distanceSoon || daysSoon ? 'due_soon' : 'ok',
  };
};

export const computeNextDue = (reminder: ReminderLike) => {
  const unit = distanceUnitOf(reminder.odometer_unit);
  const interval =
    reminder.interval_distance != null
      ? convertDistance(
          reminder.interval_distance,
          distanceUnitOf(reminder.interval_distance_unit),
          unit
        )
      : null;
  const nextOdometer =
    reminder.last_service_odometer != null && interval != null
      ? reminder.last_service_odometer + interval
      : reminder.next_due_odometer ?? null;
  const nextDate =
    reminder.last_service_date != null && reminder.interval_months != null
      ? (() => {
          const date = new Date(reminder.last_service_date);
          date.setMonth(date.getMonth() + reminder.interval_months);
          return date.getTime();
        })()
      : reminder.next_due_date ?? null;

  return { nextOdometer, nextDate, unit };
};
