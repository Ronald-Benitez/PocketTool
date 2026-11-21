import { periodContains } from '../periods/period';
import type { Period } from '../periods/types';
import { fuelOdometerPoints } from './fuel';
import { computeNextDue, latestOdometerKm } from './reminders';
import type { FuelEntryLike, ReminderLike, VehicleMaintenanceLike } from './types';
import { distanceUnitOf, toKm } from './units';

const DAY_MS = 24 * 60 * 60 * 1000;
const RATE_WINDOW_DAYS = 90;

export type VehicleReminderForecastReminder = ReminderLike & {
  id: number;
  vehicle_id: number;
  deleted_at?: number | null;
};

export type VehicleReminderForecastMaintenance = VehicleMaintenanceLike & {
  id?: number;
  vehicle_id: number;
  deleted_at?: number | null;
};

export type VehicleReminderForecastStatus =
  | 'included'
  | 'excluded';

export type VehicleReminderForecastReason =
  | 'date'
  | 'odometer'
  | 'overdue'
  | 'inactive'
  | 'deleted'
  | 'completed'
  | 'replaced'
  | 'no_data'
  | 'out_of_period';

export type VehicleReminderForecast = {
  reminderId: number;
  vehicleId: number;
  title: string;
  serviceType: string;
  amountCents: number;
  dueDate: number | null;
  dueOdometerKm: number | null;
  projectedOdometerKm: number | null;
  confidence: 'high' | 'medium' | 'low';
  status: VehicleReminderForecastStatus;
  reason: VehicleReminderForecastReason;
  hasCostEstimate: boolean;
};

export type VehicleReminderForecastInput = {
  reminders: VehicleReminderForecastReminder[];
  fuelEntries: FuelEntryLike[];
  maintenance: VehicleReminderForecastMaintenance[];
  period: Period;
  now?: number;
};

const dayNumber = (timestamp: number) => {
  const date = new Date(timestamp);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
};

const currentOdometerKm = (
  fuelEntries: FuelEntryLike[],
  maintenance: VehicleMaintenanceForecastLike[],
  now: number
) =>
  latestOdometerKm(
    fuelEntries.filter((entry) => entry.date <= now),
    maintenance.filter((entry) => entry.date <= now)
  );

type VehicleMaintenanceForecastLike = VehicleMaintenanceLike & {
  vehicle_id?: number;
  deleted_at?: number | null;
};

const averageKmPerDay = (fuelEntries: FuelEntryLike[], now: number) => {
  const cutoff = now - RATE_WINDOW_DAYS * DAY_MS;
  const points = fuelOdometerPoints(
    fuelEntries.filter((entry) => entry.date >= cutoff && entry.date <= now)
  );
  if (points.length < 2) return null;

  const first = points[0];
  const last = points[points.length - 1];
  const days = (last.date - first.date) / DAY_MS;
  if (days <= 0 || last.km <= first.km) return null;
  return (last.km - first.km) / days;
};

const estimateCost = (
  reminder: VehicleReminderForecastReminder,
  maintenance: VehicleReminderForecastMaintenance[]
) => {
  const costs = maintenance
    .filter(
      (entry) =>
        entry.deleted_at == null &&
        entry.vehicle_id === reminder.vehicle_id &&
        entry.service_type === reminder.service_type &&
        entry.cost > 0
    )
    .map((entry) => entry.cost);
  if (costs.length === 0) return 0;
  return Math.round(costs.reduce((total, cost) => total + cost, 0) / costs.length);
};

const newestActiveByService = (
  reminders: VehicleReminderForecastReminder[]
) => {
  const groups = new Map<string, VehicleReminderForecastReminder[]>();
  for (const reminder of reminders) {
    const key = `${reminder.vehicle_id}:${reminder.service_type}`;
    const list = groups.get(key) ?? [];
    list.push(reminder);
    groups.set(key, list);
  }

  const active = new Set<string>();
  for (const [key, list] of groups) {
    const candidates = list
      .filter((reminder) => reminder.deleted_at == null)
      .sort(
        (a, b) =>
          (b.last_service_date ?? 0) - (a.last_service_date ?? 0) ||
          b.id - a.id
      );
    if (candidates.length > 0) active.add(`${key}:${candidates[0].id}`);
  }
  return active;
};

/**
 * Forecasts vehicle reminders that will need attention inside a period.
 *
 * State is validated before date/odometer: inactive, deleted, replaced and
 * already serviced reminders are excluded. A reminder renewed by a maintenance
 * record keeps its new future due date and is excluded by the date/distance
 * check instead of the completed check.
 */
export const forecastVehicleRemindersInPeriod = ({
  reminders,
  fuelEntries,
  maintenance,
  period,
  now = Date.now(),
}: VehicleReminderForecastInput): VehicleReminderForecast[] => {
  const activeKeys = newestActiveByService(reminders);
  const currentKm = currentOdometerKm(fuelEntries, maintenance, now);
  const kmPerDay = averageKmPerDay(fuelEntries, now);
  const projectedKm =
    currentKm != null && kmPerDay != null
      ? currentKm + kmPerDay * Math.max(0, dayNumber(period.end) - dayNumber(now))
      : null;

  return reminders.map((reminder) => {
    const base = {
      reminderId: reminder.id,
      vehicleId: reminder.vehicle_id,
      title: reminder.title,
      serviceType: reminder.service_type,
      amountCents: 0,
      dueDate: null as number | null,
      dueOdometerKm: null as number | null,
      projectedOdometerKm: projectedKm,
      confidence: 'low' as const,
      status: 'excluded' as const,
      reason: 'no_data' as VehicleReminderForecastReason,
      hasCostEstimate: false,
    };

    if (reminder.deleted_at != null) {
      return { ...base, reason: 'deleted' as const };
    }
    if (!reminder.is_active) {
      return { ...base, reason: 'inactive' as const };
    }
    if (!activeKeys.has(`${reminder.vehicle_id}:${reminder.service_type}:${reminder.id}`)) {
      return { ...base, reason: 'replaced' as const };
    }

    const next = computeNextDue(reminder);
    const dueDate = next.nextDate ?? reminder.next_due_date ?? null;
    const dueOdometerKm =
      next.nextOdometer != null
        ? toKm(next.nextOdometer, distanceUnitOf(reminder.odometer_unit))
        : null;

    const completed = maintenance.some(
      (entry) =>
        entry.deleted_at == null &&
        entry.vehicle_id === reminder.vehicle_id &&
        entry.service_type === reminder.service_type &&
        (reminder.last_service_date == null
          ? entry.date >= period.start
          : entry.date > reminder.last_service_date)
    );
    if (completed) {
      return { ...base, dueDate, dueOdometerKm, reason: 'completed' as const };
    }

    const currentPeriod = periodContains(period, now);
    const dateDue =
      dueDate != null &&
      dueDate <= period.end &&
      (dueDate >= period.start ||
        (currentPeriod && dueDate < period.start && dueDate < now));
    const odometerDue =
      dueOdometerKm != null &&
      currentKm != null &&
      (dueOdometerKm <= currentKm ||
        (projectedKm != null && dueOdometerKm <= projectedKm));

    if (!dateDue && !odometerDue) {
      return {
        ...base,
        dueDate,
        dueOdometerKm,
        reason:
          dueDate != null || dueOdometerKm != null
            ? 'out_of_period'
            : 'no_data',
      };
    }

    const amountCents = estimateCost(reminder, maintenance);
    const confidence =
      dateDue && odometerDue ? 'high' : 'medium';

    return {
      ...base,
      amountCents,
      dueDate,
      dueOdometerKm,
      confidence,
      status: 'included',
      reason:
        dueDate != null && dueDate < period.start
          ? 'overdue'
          : dateDue
            ? 'date'
            : 'odometer',
      hasCostEstimate: amountCents > 0,
    };
  });
};
