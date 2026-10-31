import { buildFuelMetrics } from './units';
import { analyzeFuelEntries, groupFuelSegments } from './fuel';
import type {
  FuelEntryLike,
  FuelMetrics,
  VehicleMaintenanceLike,
} from './types';

export type VehicleHistoryMode = 'calendar' | 'group';

export type VehicleGroupLike = {
  id?: number;
  group_name: string;
  year: number;
  month: number;
};

export type VehicleFuelHistoryEntry = FuelEntryLike & {
  record_group_id?: number | null;
};

export type VehicleMaintenanceHistoryEntry = VehicleMaintenanceLike & {
  record_group_id?: number | null;
};

export type FuelPeriodSummary = {
  key: string;
  label: string;
  sort: number;
  totalCostCents: number;
  totalVolumeL: number;
  distanceKm: number;
  averageMetrics: FuelMetrics | null;
  averagePricePerL: number | null;
  fills: number;
  completedSegments: number;
};

export type MaintenancePeriodSummary = {
  key: string;
  label: string;
  sort: number;
  totalCostCents: number;
  entries: number;
};

type Bucket = {
  key: string;
  label: string;
  sort: number;
  totalCostCents: number;
  totalVolumeL: number;
  entryDistanceKm: number;
  segmentDistanceKm: number;
  segmentVolumeL: number;
  segmentCostCents: number;
  fills: number;
  completedSegments: number;
};

const calendarPeriod = (date: number) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = value.getMonth();
  return {
    key: `calendar-${year}-${month}`,
    label: value.toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    }),
    sort: year * 12 + month,
  };
};

const groupMapOf = (groups: VehicleGroupLike[]) =>
  new Map(
    groups.flatMap((group) =>
      group.id === undefined ? [] : [[group.id, group] as const]
    )
  );

const groupPeriod = (
  groupId: number | null | undefined,
  groups: Map<number, VehicleGroupLike>,
  unlinkedLabel: string
) => {
  if (groupId == null) {
    return { key: 'group-none', label: unlinkedLabel, sort: -1 };
  }
  const group = groups.get(groupId);
  return {
    key: `group-${groupId}`,
    label: group?.group_name ?? `#${groupId}`,
    sort: group ? group.year * 12 + group.month : -1,
  };
};

const periodFor = (
  date: number,
  groupId: number | null | undefined,
  mode: VehicleHistoryMode,
  groups: Map<number, VehicleGroupLike>,
  unlinkedLabel: string
) =>
  mode === 'calendar'
    ? calendarPeriod(date)
    : groupPeriod(groupId, groups, unlinkedLabel);

const bucketFor = (
  buckets: Map<string, Bucket>,
  key: string,
  label: string,
  sort: number
) => {
  const current = buckets.get(key);
  if (current) return current;
  const next: Bucket = {
    key,
    label,
    sort,
    totalCostCents: 0,
    totalVolumeL: 0,
    entryDistanceKm: 0,
    segmentDistanceKm: 0,
    segmentVolumeL: 0,
    segmentCostCents: 0,
    fills: 0,
    completedSegments: 0,
  };
  buckets.set(key, next);
  return next;
};

export const buildFuelHistory = (
  entries: VehicleFuelHistoryEntry[],
  mode: VehicleHistoryMode,
  groups: VehicleGroupLike[],
  unlinkedLabel: string
): FuelPeriodSummary[] => {
  const groupMap = groupMapOf(groups);
  const buckets = new Map<string, Bucket>();

  for (const entry of entries) {
    const period = periodFor(
      entry.date,
      entry.record_group_id,
      mode,
      groupMap,
      unlinkedLabel
    );
    const bucket = bucketFor(
      buckets,
      period.key,
      period.label,
      period.sort
    );
    bucket.totalCostCents += entry.total_cost;
    bucket.fills += 1;
  }

  for (const analysis of analyzeFuelEntries(entries)) {
    const period = periodFor(
      analysis.entry.date,
      (analysis.entry as VehicleFuelHistoryEntry).record_group_id,
      mode,
      groupMap,
      unlinkedLabel
    );
    const bucket = bucketFor(
      buckets,
      period.key,
      period.label,
      period.sort
    );
    bucket.totalVolumeL += analysis.volumeL;
    if (analysis.distanceKm != null) {
      bucket.entryDistanceKm += analysis.distanceKm;
    }
  }

  for (const segment of groupFuelSegments(entries)) {
    if (segment.status !== 'complete' || !segment.metrics) continue;
    const period = periodFor(
      segment.endEntry.date,
      (segment.endEntry as VehicleFuelHistoryEntry).record_group_id,
      mode,
      groupMap,
      unlinkedLabel
    );
    const bucket = bucketFor(
      buckets,
      period.key,
      period.label,
      period.sort
    );
    bucket.segmentDistanceKm += segment.metrics.distanceKm;
    bucket.segmentVolumeL += segment.metrics.volumeL;
    bucket.segmentCostCents += segment.metrics.pricePerL
      ? segment.metrics.pricePerL * segment.metrics.volumeL * 100
      : 0;
    bucket.completedSegments += 1;
  }

  return [...buckets.values()]
    .map((bucket) => {
      const distanceKm =
        bucket.segmentDistanceKm > 0
          ? bucket.segmentDistanceKm
          : bucket.entryDistanceKm;
      return {
        key: bucket.key,
        label: bucket.label,
        sort: bucket.sort,
        totalCostCents: bucket.totalCostCents,
        totalVolumeL: bucket.totalVolumeL,
        distanceKm,
        averageMetrics:
          bucket.segmentVolumeL > 0
            ? buildFuelMetrics({
                distanceKm: bucket.segmentDistanceKm,
                volumeL: bucket.segmentVolumeL,
                totalCost: bucket.segmentCostCents,
              })
            : null,
        averagePricePerL:
          bucket.totalVolumeL > 0
            ? bucket.totalCostCents / 100 / bucket.totalVolumeL
            : null,
        fills: bucket.fills,
        completedSegments: bucket.completedSegments,
      };
    })
    .sort((a, b) => a.sort - b.sort);
};

export const buildMaintenanceHistory = (
  entries: VehicleMaintenanceHistoryEntry[],
  mode: VehicleHistoryMode,
  groups: VehicleGroupLike[],
  unlinkedLabel: string
): MaintenancePeriodSummary[] => {
  const groupMap = groupMapOf(groups);
  const buckets = new Map<
    string,
    { key: string; label: string; sort: number; totalCostCents: number; entries: number }
  >();

  for (const entry of entries) {
    const period = periodFor(
      entry.date,
      entry.record_group_id,
      mode,
      groupMap,
      unlinkedLabel
    );
    const current = buckets.get(period.key) ?? {
      key: period.key,
      label: period.label,
      sort: period.sort,
      totalCostCents: 0,
      entries: 0,
    };
    current.totalCostCents += entry.cost;
    current.entries += 1;
    buckets.set(period.key, current);
  }

  return [...buckets.values()].sort((a, b) => a.sort - b.sort);
};
