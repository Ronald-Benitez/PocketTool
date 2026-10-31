import type {
  ConsumptionFormat,
  FuelEntryAnalysis,
  FuelEntryLike,
  FuelSegment,
  FuelSegmentStatus,
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
  let hasBaselineFull = false;
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

    if (hasBaselineFull) {
      if (distanceKm != null) segmentDistanceKm += distanceKm;
      segmentVolumeL += volumeL;
      segmentCostCents += entry.total_cost;
    }

    if (isFull) {
      if (hasBaselineFull && segmentDistanceKm > 0) {
        segmentMetrics = buildFuelMetrics({
          distanceKm: segmentDistanceKm,
          volumeL: segmentVolumeL,
          totalCost: segmentCostCents,
        });
        segmentStatus = 'complete';
      } else {
        segmentStatus = hasBaselineFull ? 'accumulating' : 'estimated';
      }
      hasBaselineFull = true;
      segmentDistanceKm = 0;
      segmentVolumeL = 0;
      segmentCostCents = 0;
    } else if (hasBaselineFull) {
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

const isFullTank = (entry: FuelEntryLike) => Boolean(entry.is_full_tank ?? 1);

export const groupFuelSegments = (entries: FuelEntryLike[]): FuelSegment[] => {
  const analyses = analyzeFuelEntries(entries);
  const segments: FuelSegment[] = [];
  let baseline: FuelEntryAnalysis | null = null;
  let current: FuelEntryAnalysis[] = [];
  let prelude: FuelEntryAnalysis[] = [];
  let firstBaselineIncluded = false;
  let nextId = 0;

  const push = (
    status: FuelSegmentStatus,
    start: FuelEntryLike,
    end: FuelEntryLike,
    items: FuelEntryAnalysis[],
    metrics: FuelSegment['metrics']
  ) => {
    segments.push({
      id: nextId,
      status,
      startEntry: start,
      endEntry: end,
      entries: [...items],
      metrics,
    });
    nextId += 1;
  };

  const includeBaseline = (items: FuelEntryAnalysis[]) => {
    if (firstBaselineIncluded || !baseline) return [...items];
    firstBaselineIncluded = true;
    return [baseline, ...items];
  };

  for (const analysis of analyses) {
    const full = isFullTank(analysis.entry);

    if (!baseline) {
      if (!full) {
        prelude.push(analysis);
        continue;
      }
      if (prelude.length > 0) {
        push(
          'no_baseline',
          prelude[0].entry,
          prelude[prelude.length - 1].entry,
          prelude,
          null
        );
        prelude = [];
      }
      baseline = analysis;
      current = [];
      continue;
    }

    current.push(analysis);

    if (!full) continue;

    push(
      'complete',
      baseline.entry,
      analysis.entry,
      includeBaseline(current),
      analysis.segmentMetrics
    );
    baseline = analysis;
    current = [];
  }

  if (prelude.length > 0) {
    push(
      'no_baseline',
      prelude[0].entry,
      prelude[prelude.length - 1].entry,
      prelude,
      null
    );
  }

  if (baseline) {
    const items = includeBaseline(current);
    if (items.length > 0) {
      push(
        'in_progress',
        baseline.entry,
        items[items.length - 1].entry,
        items,
        null
      );
    }
  }

  return segments;
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
  const completed = analyses.filter((item) => item.segmentMetrics != null);
  const completedDistanceKm = completed.reduce(
    (total, item) => total + (item.segmentMetrics?.distanceKm ?? 0),
    0
  );
  const completedVolumeL = completed.reduce(
    (total, item) => total + (item.segmentMetrics?.volumeL ?? 0),
    0
  );
  const completedCostCents = completed.reduce((total, item) => {
    const metrics = item.segmentMetrics;
    return total + (metrics?.pricePerL ?? 0) * (metrics?.volumeL ?? 0) * 100;
  }, 0);
  const averageMetrics =
    completed.length > 0
      ? buildFuelMetrics({
          distanceKm: completedDistanceKm,
          volumeL: completedVolumeL,
          totalCost: completedCostCents,
        })
      : null;

  const comparable = analyses.flatMap((item) => {
    const value = selectConsumption(item.segmentMetrics, format);
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
