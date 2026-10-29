import { useSQLiteContext } from 'expo-sqlite';

import type { Cents, TimestampMs } from '@/src/interfaces/schema';

export interface FuelRefillRow {
  id: number;
  date: TimestampMs | null;
  odometer_reading: number;
  total_cost: Cents;
  gallons: number;
  price_per_gallon: Cents;
  is_full_tank: number;
  notes: string | null;
}

export interface FuelBlockAnalytics {
  block_id: number;
  block_start_date: TimestampMs | null;
  block_end_date: TimestampMs | null;
  start_odometer: number;
  end_odometer: number;
  distance_km: number;
  block_total_cost: Cents;
  block_total_gallons: number;
  km_per_gallon: number | null;
  km_per_liter: number | null;
  cost_per_km: number | null;
}

export interface FuelSummary {
  start_date: TimestampMs | null;
  end_date: TimestampMs | null;
  total_distance_km: number | null;
  total_spent: Cents | null;
  total_gallons: number | null;
  total_liters: number | null;
  avg_price_per_gallon: number | null;
  overall_km_per_gallon: number | null;
  overall_km_per_liter: number | null;
  overall_cost_per_km: number | null;
}

export interface TripMetrics {
  trip_type: string | null;
  total_trips: number;
  total_distance: number | null;
  avg_tablero_consumption: number | null;
  min_tablero_consumption: number | null;
  max_tablero_consumption: number | null;
}

export interface TripLogRow {
  id: number;
  date: TimestampMs | null;
  distance_trip_log: number;
  tablero_avg_consumption: number | null;
  is_counter_reset: number | null;
  trip_type: string | null;
  notes: string | null;
}

const ACTIVE_REFILLS_SQL = `
  SELECT id, date, odometer_reading, total_cost, gallons, price_per_gallon, is_full_tank, notes
  FROM fuel_refills
  WHERE deleted_at IS NULL
  ORDER BY odometer_reading ASC;
`;

const CLOSED_BLOCKS_SQL = `
  WITH refills_with_groups AS (
    SELECT
      id,
      date,
      odometer_reading,
      total_cost,
      gallons,
      is_full_tank,
      SUM(is_full_tank) OVER (
        ORDER BY odometer_reading
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ) AS block_id
    FROM fuel_refills
    WHERE deleted_at IS NULL
  )
  SELECT
    block_id,
    MIN(date) AS block_start_date,
    MAX(date) AS block_end_date,
    MIN(odometer_reading) AS start_odometer,
    MAX(odometer_reading) AS end_odometer,
    (MAX(odometer_reading) - MIN(odometer_reading)) AS distance_km,
    SUM(total_cost) AS block_total_cost,
    SUM(gallons) AS block_total_gallons,
    (MAX(odometer_reading) - MIN(odometer_reading)) / NULLIF(SUM(gallons), 0) AS km_per_gallon,
    (MAX(odometer_reading) - MIN(odometer_reading)) / NULLIF(SUM(gallons) * 3.78541, 0) AS km_per_liter,
    SUM(total_cost) / NULLIF((MAX(odometer_reading) - MIN(odometer_reading)), 0) AS cost_per_km
  FROM refills_with_groups
  WHERE block_id IS NOT NULL
  GROUP BY block_id
  HAVING MAX(is_full_tank) = 1
    AND (MAX(odometer_reading) - MIN(odometer_reading)) > 0
  ORDER BY block_id DESC;
`;

const CURRENT_BLOCK_SQL = `
  WITH last_full_tank AS (
    SELECT MAX(odometer_reading) AS last_full_odometer
    FROM fuel_refills
    WHERE is_full_tank = 1 AND deleted_at IS NULL
  )
  SELECT f.id, f.date, f.odometer_reading, f.total_cost, f.gallons, f.is_full_tank
  FROM fuel_refills f, last_full_tank lft
  WHERE f.deleted_at IS NULL
    AND f.odometer_reading >= lft.last_full_odometer
  ORDER BY f.odometer_reading ASC;
`;

const SUMMARY_BY_RANGE_SQL = `
  SELECT
    MIN(date) AS start_date,
    MAX(date) AS end_date,
    MAX(odometer_reading) - MIN(odometer_reading) AS total_distance_km,
    SUM(total_cost) AS total_spent,
    SUM(gallons) AS total_gallons,
    SUM(gallons) * 3.78541 AS total_liters,
    AVG(price_per_gallon) AS avg_price_per_gallon,
    (MAX(odometer_reading) - MIN(odometer_reading)) / NULLIF(SUM(gallons), 0) AS overall_km_per_gallon,
    (MAX(odometer_reading) - MIN(odometer_reading)) / NULLIF(SUM(gallons) * 3.78541, 0) AS overall_km_per_liter,
    SUM(total_cost) / NULLIF((MAX(odometer_reading) - MIN(odometer_reading)), 0) AS overall_cost_per_km
  FROM fuel_refills
  WHERE deleted_at IS NULL AND date BETWEEN ? AND ?;
`;

const TRIP_METRICS_SQL = `
  SELECT
    trip_type,
    COUNT(*) AS total_trips,
    SUM(distance_traveled) AS total_distance,
    AVG(average_consumption) AS avg_tablero_consumption,
    MIN(average_consumption) AS min_tablero_consumption,
    MAX(average_consumption) AS max_tablero_consumption
  FROM trip_logs
  WHERE deleted_at IS NULL
  GROUP BY trip_type;
`;

const TRIP_LOGS_SQL = `
  SELECT
    id,
    date,
    distance_traveled AS distance_trip_log,
    average_consumption AS tablero_avg_consumption,
    is_counter_reset,
    trip_type,
    notes
  FROM trip_logs
  WHERE deleted_at IS NULL
  ORDER BY date DESC;
`;

export const useFuelRepository = () => {
  const db = useSQLiteContext();

  const fetchActiveRefills = async (): Promise<FuelRefillRow[]> =>
    db.getAllAsync<FuelRefillRow>(ACTIVE_REFILLS_SQL);

  const fetchClosedBlocks = async (): Promise<FuelBlockAnalytics[]> =>
    db.getAllAsync<FuelBlockAnalytics>(CLOSED_BLOCKS_SQL);

  const fetchCurrentBlock = async (): Promise<FuelRefillRow[]> =>
    db.getAllAsync<FuelRefillRow>(CURRENT_BLOCK_SQL);

  const fetchSummary = async (
    startDate: number,
    endDate: number
  ): Promise<FuelSummary | null> => {
    const rows = await db.getAllAsync<FuelSummary>(SUMMARY_BY_RANGE_SQL, [startDate, endDate]);
    return rows[0] ?? null;
  };

  const fetchTripMetrics = async (): Promise<TripMetrics[]> =>
    db.getAllAsync<TripMetrics>(TRIP_METRICS_SQL);

  const fetchTripLogs = async (): Promise<TripLogRow[]> =>
    db.getAllAsync<TripLogRow>(TRIP_LOGS_SQL);

  return {
    fetchActiveRefills,
    fetchClosedBlocks,
    fetchCurrentBlock,
    fetchSummary,
    fetchTripMetrics,
    fetchTripLogs,
  };
};
