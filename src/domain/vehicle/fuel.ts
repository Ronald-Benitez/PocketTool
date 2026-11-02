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
  convertDistance,
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
    const volumeL = toLiters(entry.volume ?? 0, volumeUnit);
    const totalCostCents = entry.total_cost ?? 0;
    const odometerKm = entry.odometer != null ? toKm(entry.odometer, distanceUnit) : null;

    let distanceKm: number | null = null;
    if (odometerKm != null && previousOdometerKm != null) {
      distanceKm = Math.max(0, odometerKm - previousOdometerKm);
    } else if (entry.distance_traveled != null) {
      distanceKm = toKm(entry.distance_traveled, distanceUnit);
    }

    const metrics =
      distanceKm != null && distanceKm > 0 && volumeL > 0
        ? buildFuelMetrics({
            distanceKm,
            volumeL,
            totalCost: totalCostCents,
          })
        : null;

    const isBaseline = Boolean(entry.is_baseline ?? 0);
    const isFull = isBaseline || Boolean(entry.is_full_tank ?? 1);
    let segmentMetrics = null;
    let segmentStatus: FuelEntryAnalysis['segmentStatus'] =
      distanceKm == null ? 'accumulating' : 'estimated';

    if (isBaseline) {
      hasBaselineFull = true;
      segmentDistanceKm = 0;
      segmentVolumeL = 0;
      segmentCostCents = 0;
      segmentStatus = 'estimated';
    } else {
      if (hasBaselineFull) {
        if (distanceKm != null) segmentDistanceKm += distanceKm;
        segmentVolumeL += volumeL;
        segmentCostCents += totalCostCents;
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

const isFullTank = (entry: FuelEntryLike) =>
  Boolean(entry.is_baseline ?? 0) || Boolean(entry.is_full_tank ?? 1);

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

    if (Boolean(analysis.entry.is_baseline ?? 0)) {
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

export type PartialOdometerResolution =
  | {
      ok: true;
      odometer: number;
      distanceTraveled: number;
      odometerSource: 'inferred';
      distanceSource: 'manual' | 'inferred';
    }
  | { ok: false; error: 'PREVIOUS_ODOMETER_REQUIRED' };

export const resolvePartialOdometer = ({
  distanceTraveled,
  distanceUnit,
  previousOdometer,
  previousDistanceUnit,
}: {
  distanceTraveled?: number | null;
  distanceUnit: string;
  previousOdometer?: number | null;
  previousDistanceUnit?: string | null;
}): PartialOdometerResolution => {
  if (previousOdometer == null || previousOdometer <= 0) {
    return { ok: false, error: 'PREVIOUS_ODOMETER_REQUIRED' };
  }

  const currentUnit = distanceUnitOf(distanceUnit);
  const previousUnit = distanceUnitOf(previousDistanceUnit);
  const previousInCurrentUnit = convertDistance(
    previousOdometer,
    previousUnit,
    currentUnit
  );
  const hasDistance = distanceTraveled != null && distanceTraveled > 0;

  if (hasDistance) {
    return {
      ok: true,
      odometer: previousInCurrentUnit + (distanceTraveled ?? 0),
      distanceTraveled: distanceTraveled ?? 0,
      odometerSource: 'inferred',
      distanceSource: 'manual',
    };
  }

  return {
    ok: true,
    odometer: previousInCurrentUnit,
    distanceTraveled: 0,
    odometerSource: 'inferred',
    distanceSource: 'inferred',
  };
};

const startOfLocalDay = (timestamp: number) => {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

export type PreviousFuelCandidate = {
  id?: number;
  date: number;
  odometer?: number | null;
  is_baseline?: boolean | number | null;
};

/**
 * Picks the reading a partial fill should inherit. Entries are compared by
 * calendar day because the date picker stores midnight while new records use
 * the current time; both represent the same day. When nothing qualifies, the
 * baseline is used as the initial odometer even if its timestamp is later.
 */
export const selectPreviousFuelEntry = <T extends PreviousFuelCandidate>(
  entries: T[],
  date: number,
  excludeId?: number
): T | null => {
  const targetDay = startOfLocalDay(date);
  const candidates = entries.filter(
    (entry) =>
      entry.id !== excludeId && entry.odometer != null && entry.odometer > 0
  );

  const previous = candidates
    .filter((entry) => {
      const entryDay = startOfLocalDay(entry.date);
      if (entryDay < targetDay) return true;
      if (entryDay > targetDay) return false;
      if (excludeId === undefined) return true;
      return (entry.id ?? 0) < excludeId;
    })
    .sort((a, b) => b.date - a.date || (b.id ?? 0) - (a.id ?? 0))[0];

  if (previous) return previous;

  return (
    candidates
      .filter((entry) => Boolean(entry.is_baseline))
      .sort((a, b) => a.date - b.date || (a.id ?? 0) - (b.id ?? 0))[0] ?? null
  );
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
  const totalSpentCents = entries.reduce(
    (total, item) => total + (item.total_cost ?? 0),
    0
  );
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
