import type {
  ConsumptionFormat,
  DistanceUnit,
  FuelEntryAnalysis,
  VolumeUnit,
} from './types';
import type {
  FuelPeriodSummary,
  MaintenancePeriodSummary,
} from './history';
import {
  consumptionUnits,
  convertPricePerUnit,
  convertVolume,
  fromKm,
  selectConsumption,
  volumeUnitOf,
} from './units';

const clean = (value: string, fallback: string) => {
  const normalized = value.replace(/["[\]{}();\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
  return normalized ? normalized.slice(0, 24) : fallback;
};

export const buildConsumptionChart = (
  entries: FuelEntryAnalysis[],
  format: ConsumptionFormat,
  title: string
) => {
  const points = entries
    .map((entry) => ({
      date: entry.entry.date,
      value: selectConsumption(entry.segmentMetrics, format),
    }))
    .filter((point): point is { date: number; value: number } => point.value != null);

  if (points.length < 2) return null;
  const values = points.map((point) => Number(point.value.toFixed(3)));
  const max = Math.max(...values, 1);
  const axisMax = Math.ceil(max * 1.15);

  return [
    'xychart-beta',
    `  title "${clean(title, title)}"`,
    `  x-axis [${points
      .map((point) => `"${new Date(point.date).toLocaleDateString()}"`)
      .join(', ')}]`,
    `  y-axis "${clean(consumptionUnits(format), consumptionUnits(format))}" 0 --> ${axisMax}`,
    `  line [${values.join(', ')}]`,
  ].join('\n');
};

export const buildVolumeChart = (
  entries: FuelEntryAnalysis[],
  unit: VolumeUnit,
  title: string
) => {
  const points = entries.flatMap((entry) => {
    const volume = entry.entry.volume;
    if (volume == null || volume <= 0) return [];
    return [
      {
        date: entry.entry.date,
        value: convertVolume(
          volume,
          volumeUnitOf(entry.entry.volume_unit),
          unit
        ),
      },
    ];
  });

  if (points.length < 2) return null;
  const values = points.map((point) => Number(point.value.toFixed(3)));
  const max = Math.max(...values, 1);
  const axisMax = Math.ceil(max * 1.15);
  const unitLabel = unit === 'L' ? 'L' : 'gal';

  return [
    'xychart-beta',
    `  title "${clean(title, title)}"`,
    `  x-axis [${points
      .map((point) => `"${new Date(point.date).toLocaleDateString()}"`)
      .join(', ')}]`,
    `  y-axis "${clean(unitLabel, unitLabel)}" 0 --> ${axisMax}`,
    `  bar [${values.join(', ')}]`,
  ].join('\n');
};

export const buildPriceChart = (
  entries: FuelEntryAnalysis[],
  unit: VolumeUnit,
  title: string
) => {
  const points = entries.flatMap((entry) => {
    const price = entry.entry.price_per_unit;
    if (price == null || price <= 0) return [];
    return [
      {
        date: entry.entry.date,
        value: convertPricePerUnit(
          price / 100,
          volumeUnitOf(entry.entry.volume_unit),
          unit
        ),
      },
    ];
  });

  if (points.length < 2) return null;
  const values = points.map((point) => Number(point.value.toFixed(3)));
  const max = Math.max(...values, 1);
  const axisMax = Math.ceil(max * 1.15);
  const unitLabel = unit === 'L' ? '$/L' : '$/gal';

  return [
    'xychart-beta',
    `  title "${clean(title, title)}"`,
    `  x-axis [${points
      .map((point) => `"${new Date(point.date).toLocaleDateString()}"`)
      .join(', ')}]`,
    `  y-axis "${clean(unitLabel, unitLabel)}" 0 --> ${axisMax}`,
    `  line [${values.join(', ')}]`,
  ].join('\n');
};

export const buildTotalSpendChart = (
  entries: FuelEntryAnalysis[],
  title: string
) => {
  const points = entries.flatMap((entry) => {
    const total = entry.entry.total_cost;
    if (total == null || total <= 0) return [];
    return [{ date: entry.entry.date, value: total / 100 }];
  });

  if (points.length < 2) return null;
  const values = points.map((point) => Number(point.value.toFixed(2)));
  const max = Math.max(...values, 1);
  const axisMax = Math.ceil(max * 1.15);

  return [
    'xychart-beta',
    `  title "${clean(title, title)}"`,
    `  x-axis [${points
      .map((point) => `"${new Date(point.date).toLocaleDateString()}"`)
      .join(', ')}]`,
    `  y-axis "$" 0 --> ${axisMax}`,
    `  bar [${values.join(', ')}]`,
  ].join('\n');
};

export const buildMobilityComparisonChart = (
  entries: FuelEntryAnalysis[],
  volumeUnit: VolumeUnit,
  distanceUnit: DistanceUnit,
  title: string
) => {
  const points = entries.flatMap((entry) => {
    const metrics = entry.segmentMetrics;
    if (!metrics) return [];
    const volume = convertVolume(metrics.volumeL, 'L', volumeUnit);
    const distance = fromKm(metrics.distanceKm, distanceUnit);
    const total =
      metrics.pricePerL != null
        ? metrics.pricePerL * metrics.volumeL
        : null;
    if (volume <= 0 || distance <= 0 || total == null || total <= 0) {
      return [];
    }
    return [{ date: entry.entry.date, volume, distance, total }];
  });

  if (points.length < 2) return null;
  const first = points[0];
  const volumeValues = points.map((point) =>
    Number(((point.volume / first.volume) * 100).toFixed(2))
  );
  const distanceValues = points.map((point) =>
    Number(((point.distance / first.distance) * 100).toFixed(2))
  );
  const totalValues = points.map((point) =>
    Number(((point.total / first.total) * 100).toFixed(2))
  );
  const max = Math.max(
    ...volumeValues,
    ...distanceValues,
    ...totalValues,
    100
  );
  const axisMax = Math.ceil(max * 1.15);

  return [
    'xychart-beta',
    `  title "${clean(title, title)}"`,
    `  x-axis [${points
      .map((point) => `"${new Date(point.date).toLocaleDateString()}"`)
      .join(', ')}]`,
    `  y-axis "Index (base 100)" 0 --> ${axisMax}`,
    `  line [${volumeValues.join(', ')}]`,
    `  line [${distanceValues.join(', ')}]`,
    `  line [${totalValues.join(', ')}]`,
  ].join('\n');
};

export const buildPeriodSpendChart = (
  rows: FuelPeriodSummary[],
  title: string
) => {
  const periodRows = rows;
  if (periodRows.length < 2) return null;
  const values = periodRows.map((row) => Number((row.totalCostCents / 100).toFixed(2)));
  const max = Math.max(...values, 1);
  const axisMax = Math.ceil(max * 1.15);

  return [
    'xychart-beta',
    `  title "${clean(title, title)}"`,
    `  x-axis [${periodRows.map((row) => `"${clean(row.label, '')}"`).join(', ')}]`,
    `  y-axis "Total" 0 --> ${axisMax}`,
    `  bar [${values.join(', ')}]`,
  ].join('\n');
};

export const buildFuelMaintenanceComparisonChart = (
  fuel: FuelPeriodSummary[],
  maintenance: MaintenancePeriodSummary[],
  labels: {
    title: string;
    fuel: string;
    maintenance: string;
  }
) => {
  const maintenanceByKey = new Map(
    maintenance.map((row) => [row.key, row] as const)
  );
  const fuelByKey = new Map(fuel.map((row) => [row.key, row] as const));
  const keys = new Map<
    string,
    { key: string; label: string; sort: number }
  >();
  for (const row of [...fuel, ...maintenance]) {
    if (!keys.has(row.key)) {
      keys.set(row.key, { key: row.key, label: row.label, sort: row.sort });
    }
  }
  const rows = [...keys.values()].sort((a, b) => a.sort - b.sort);
  if (rows.length < 2) return null;

  const fuelValues = rows.map((row) =>
    Number(((fuelByKey.get(row.key)?.totalCostCents ?? 0) / 100).toFixed(2))
  );
  const maintenanceValues = rows.map((row) =>
    Number(((maintenanceByKey.get(row.key)?.totalCostCents ?? 0) / 100).toFixed(2))
  );
  const max = Math.max(...fuelValues, ...maintenanceValues, 1);
  const axisMax = Math.ceil(max * 1.15);

  return [
    'xychart-beta',
    `  title "${clean(labels.title, labels.title)}"`,
    `  x-axis [${rows.map((row) => `"${clean(row.label, '')}"`).join(', ')}]`,
    `  y-axis "${clean(labels.fuel, labels.fuel)} / ${clean(
      labels.maintenance,
      labels.maintenance
    )}" 0 --> ${axisMax}`,
    `  bar [${fuelValues.join(', ')}]`,
    `  bar [${maintenanceValues.join(', ')}]`,
  ].join('\n');
};

export const buildMonthlySpendChart = (
  entries: { date: number; total_cost: number | null }[],
  title: string
) => {
  const months = new Map<string, { label: string; total: number; sort: number }>();
  for (const entry of entries) {
    const date = new Date(entry.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const current = months.get(key) ?? {
      label: `${date.toLocaleString('en', { month: 'short' })} ${date.getFullYear()}`,
      total: 0,
      sort: date.getFullYear() * 12 + date.getMonth(),
    };
    current.total += (entry.total_cost ?? 0) / 100;
    months.set(key, current);
  }
  const rows = [...months.values()].sort((a, b) => a.sort - b.sort);
  if (rows.length < 2) return null;
  const max = Math.max(...rows.map((row) => row.total), 1);
  const axisMax = Math.ceil(max * 1.15);

  return [
    'xychart-beta',
    `  title "${clean(title, title)}"`,
    `  x-axis [${rows.map((row) => `"${clean(row.label, '')}"`).join(', ')}]`,
    `  y-axis "Total" 0 --> ${axisMax}`,
    `  bar [${rows.map((row) => Number(row.total.toFixed(2))).join(', ')}]`,
  ].join('\n');
};
