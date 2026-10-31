import type {
  ConsumptionFormat,
  FuelEntryAnalysis,
  FuelEntryLike,
  FuelStats,
} from './types';
import {
  buildFuelMetrics,
  distanceUnitOf,
  selectConsumption,
  toKm,
  toLiters,
  volumeUnitOf,
} from './units';

const sortEntries = (entries: FuelEntryLike[]) =>
  [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date - b.date;
    return (a.odometer ?? 0) - (b.odometer ?? 0);
  });

export const analyzeFuelEntries = (entries: FuelEntryLike[]): FuelEntryAnalysis[] => {
  const sorted = sortEntries(entries);
  let previous: FuelEntryLike | undefined;
  let previousOdometerKm: number | null = null;
  let lastFullOdometerKm: number | null = null;
  let segmentDistanceKm = 0;
  let segmentVolumeL = 0;
  let segmentCostCents = 0;

  return sorted.map((entry) => {
    const distanceUnit = distanceUnitOf(entry.distance_unit);
    const volumeUnit = volumeUnitOf(entry.volume_unit);
    const volumeL = toLiters(entry.volume, volumeUnit);
    const odometerKm = entry.odometer != null ? toKm(entry.odometer, distanceUnit) : null;

    let distanceKm: number | null = null;
    if (odometerKm != null && previousOdometerKm != null) {
      distanceKm = Math.max(0, odometerKm - previousOdometerKm);
    } else if (entry.distance_traveled != null) {
      distanceKm = toKm(entry.distance_traveled, distanceUnit);
    }

    const metrics =
      distanceKm != null && distanceKm > 0
        ? buildFuelMetrics({
            distanceKm,
            volumeL,
            totalCost: entry.total_cost,
          })
        : null;

    const isFull = Boolean(entry.is_full_tank ?? 1);
    let segmentMetrics = null;
    let segmentStatus: FuelEntryAnalysis['segmentStatus'] =
      distanceKm == null ? 'accumulating' : 'estimated';

    if (lastFullOdometerKm != null) {
      if (distanceKm != null) segmentDistanceKm += distanceKm;
      segmentVolumeL += volumeL;
      segmentCostCents += entry.total_cost;
    }

    if (isFull) {
      if (lastFullOdometerKm != null && segmentDistanceKm > 0) {
        segmentMetrics = buildFuelMetrics({
          distanceKm: segmentDistanceKm,
          volumeL: segmentVolumeL,
          totalCost: segmentCostCents,
        });
        segmentStatus = 'complete';
      } else {
        segmentStatus = 'accumulating';
      }
      lastFullOdometerKm = odometerKm;
      segmentDistanceKm = 0;
      segmentVolumeL = 0;
      segmentCostCents = 0;
    } else if (lastFullOdometerKm != null) {
      segmentStatus = 'accumulating';
    }

    if (odometerKm != null) previousOdometerKm = odometerKm;

    const analysis: FuelEntryAnalysis = {
      entry,
      distanceKm,
      distanceUnit,
      volumeL,
      metrics,
      segmentMetrics,
      segmentStatus,
      previousEntry: previous,
    };
    previous = entry;
    return analysis;
  });
};

export const buildFuelStats = (
  entries: FuelEntryLike[],
  format: ConsumptionFormat
): FuelStats => {
  const analyses = analyzeFuelEntries(entries);
  const totalDistanceKm = analyses.reduce(
    (total, item) => total + (item.distanceKm ?? 0),
    0
  );
  const totalVolumeL = analyses.reduce((total, item) => total + item.volumeL, 0);
  const totalSpentCents = entries.reduce((total, item) => total + item.total_cost, 0);
  const averageMetrics = buildFuelMetrics({
    distanceKm: totalDistanceKm,
    volumeL: totalVolumeL,
    totalCost: totalSpentCents,
  });

  const comparable = analyses.flatMap((item) => {
    const value = selectConsumption(item.segmentMetrics ?? item.metrics, format);
    return value == null || !Number.isFinite(value) ? [] : [{ item, value }];
  });
  const sorted = [...comparable].sort((a, b) => a.value - b.value);
  const lowerIsBetter = [
    'l_100km',
    'gal_100km',
    'l_60mi',
    'gal_60mi',
  ].includes(format);
  const best = sorted.length
    ? (lowerIsBetter ? sorted[0] : sorted[sorted.length - 1]).item
    : null;
  const worst = sorted.length
    ? (lowerIsBetter ? sorted[sorted.length - 1] : sorted[0]).item
    : null;

  return {
    totalDistanceKm,
    totalVolumeL,
    totalSpentCents,
    averagePricePerL: totalVolumeL > 0 ? totalSpentCents / 100 / totalVolumeL : null,
    averagePricePerGal:
      totalVolumeL > 0
        ? totalSpentCents / 100 / (totalVolumeL / 3.785411784)
        : null,
    averageMetrics,
    best,
    worst,
    entries: analyses,
  };
};
