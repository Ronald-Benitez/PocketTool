import type { ChartSpec } from '@/src/domain/charts/types';
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
  convertVolume,
  fromKm,
  selectConsumption,
} from './units';

export const buildConsumptionChart = (
  entries: FuelEntryAnalysis[],
  format: ConsumptionFormat,
  title: string
): ChartSpec | null => {
  const points = entries
    .map((entry) => ({
      x: entry.entry.date,
      y: selectConsumption(entry.segmentMetrics, format),
    }))
    .filter(
      (point): point is { x: number; y: number } => point.y != null
    );

  if (points.length < 2) return null;

  return {
    kind: 'line',
    title,
    xAxis: { type: 'time', format: 'date' },
    yAxis: { format: 'unit', unit: consumptionUnits(format) },
    series: [
      {
        key: 'consumption',
        label: title,
        tone: 'consumption',
        points,
      },
    ],
  };
};

type SegmentChartPoint = {
  date: number;
  volume: number;
  price: number | null;
  total: number | null;
  distanceKm: number;
};

const buildSegmentPoints = (
  entries: FuelEntryAnalysis[],
  volumeUnit: VolumeUnit
): SegmentChartPoint[] =>
  entries.flatMap((entry) => {
    const metrics = entry.segmentMetrics;
    if (!metrics) return [];
    return [
      {
        date: entry.entry.date,
        volume: convertVolume(metrics.volumeL, 'L', volumeUnit),
        price:
          volumeUnit === 'L' ? metrics.pricePerL : metrics.pricePerGal,
        total:
          metrics.pricePerL != null
            ? metrics.pricePerL * metrics.volumeL
            : null,
        distanceKm: metrics.distanceKm,
      },
    ];
  });

export const buildVolumeChart = (
  entries: FuelEntryAnalysis[],
  unit: VolumeUnit,
  title: string
): ChartSpec | null => {
  const points = buildSegmentPoints(entries, unit).filter(
    (point) => point.volume > 0
  );
  if (points.length < 2) return null;

  return {
    kind: 'bar',
    title,
    xAxis: { type: 'category', format: 'date' },
    yAxis: { format: 'unit', unit: unit === 'L' ? 'L' : 'gal' },
    series: [
      {
        key: 'volume',
        label: title,
        tone: 'distance',
        points: points.map((point) => ({
          x: point.date,
          y: Number(point.volume.toFixed(3)),
        })),
      },
    ],
  };
};

export const buildPriceChart = (
  entries: FuelEntryAnalysis[],
  unit: VolumeUnit,
  title: string
): ChartSpec | null => {
  const points = buildSegmentPoints(entries, unit).filter(
    (point): point is SegmentChartPoint & { price: number } =>
      point.price != null && point.price > 0
  );
  if (points.length < 2) return null;

  return {
    kind: 'line',
    title,
    xAxis: { type: 'time', format: 'date' },
    yAxis: { format: 'currency', unit: unit === 'L' ? '/L' : '/gal' },
    series: [
      {
        key: 'price',
        label: title,
        tone: 'fuel',
        points: points.map((point) => ({
          x: point.date,
          y: Math.round(point.price * 100),
        })),
      },
    ],
  };
};

export const buildTotalSpendChart = (
  entries: FuelEntryAnalysis[],
  unit: VolumeUnit,
  title: string
): ChartSpec | null => {
  const points = buildSegmentPoints(entries, unit).filter(
    (point): point is SegmentChartPoint & { total: number } =>
      point.total != null && point.total > 0
  );
  if (points.length < 2) return null;

  return {
    kind: 'bar',
    title,
    xAxis: { type: 'category', format: 'date' },
    yAxis: { format: 'money' },
    series: [
      {
        key: 'total',
        label: title,
        tone: 'fuel',
        points: points.map((point) => ({
          x: point.date,
          y: Math.round(point.total * 100),
        })),
      },
    ],
  };
};

export type MobilityChartMode = 'index' | 'real';

export const buildMobilityComparisonChart = (
  entries: FuelEntryAnalysis[],
  volumeUnit: VolumeUnit,
  distanceUnit: DistanceUnit,
  title: string,
  labels: { volume: string; distance: string; total: string } = {
    volume: 'Volume',
    distance: 'Distance',
    total: 'Total',
  },
  mode: MobilityChartMode = 'index'
): ChartSpec | null => {
  const points = buildSegmentPoints(entries, volumeUnit)
    .filter(
      (point): point is SegmentChartPoint & { total: number } =>
        point.volume > 0 &&
        point.distanceKm > 0 &&
        point.total != null &&
        point.total > 0
    )
    .map((point) => ({
      ...point,
      distance: fromKm(point.distanceKm, distanceUnit),
    }));

  if (points.length < 2) return null;
  const first = points[0];
  const volumeValues = points.map(
    (point) => Number(((point.volume / first.volume) * 100).toFixed(2))
  );
  const distanceValues = points.map(
    (point) => Number(((point.distance / first.distance) * 100).toFixed(2))
  );
  const totalValues = points.map(
    (point) => Number(((point.total / first.total) * 100).toFixed(2))
  );
  const volumeRaw = points.map((point) => Number(point.volume.toFixed(3)));
  const distanceRaw = points.map((point) => Number(point.distance.toFixed(3)));
  const totalRaw = points.map((point) => Number(point.total.toFixed(2)));
  const volumeLabel = volumeUnit === 'L' ? 'L' : 'gal';
  const distanceLabel = distanceUnit === 'km' ? 'km' : 'mi';
  const plotted = (index: number, raw: number[], indexed: number[]) =>
    mode === 'real' ? raw[index] : indexed[index];

  return {
    kind: 'line',
    title,
    xAxis: { type: 'time', format: 'date' },
    yAxis: { format: mode === 'real' ? 'number' : 'index' },
    series: [
      {
        key: 'volume',
        label: labels.volume,
        tone: 'consumption',
        points: points.map((point, index) => ({
          x: point.date,
          y: plotted(index, volumeRaw, volumeValues),
          tooltipValue: volumeRaw[index],
          tooltipFormat: 'unit',
          tooltipUnit: volumeLabel,
        })),
      },
      {
        key: 'distance',
        label: labels.distance,
        tone: 'distance',
        points: points.map((point, index) => ({
          x: point.date,
          y: plotted(index, distanceRaw, distanceValues),
          tooltipValue: distanceRaw[index],
          tooltipFormat: 'unit',
          tooltipUnit: distanceLabel,
        })),
      },
      {
        key: 'total',
        label: labels.total,
        tone: 'fuel',
        points: points.map((point, index) => ({
          x: point.date,
          y: plotted(index, totalRaw, totalValues),
          tooltipValue: totalRaw[index],
          tooltipFormat: 'currency_units',
        })),
      },
    ],
  };
};

export const buildPeriodSpendChart = (
  rows: FuelPeriodSummary[],
  title: string
): ChartSpec | null => {
  if (rows.length < 2) return null;

  return {
    kind: 'bar',
    title,
    xAxis: { type: 'category', format: 'text' },
    yAxis: { format: 'money' },
    series: [
      {
        key: 'period',
        label: title,
        tone: 'fuel',
        points: rows.map((row) => ({
          x: row.label,
          y: row.totalCostCents,
        })),
      },
    ],
  };
};

export const buildFuelMaintenanceComparisonChart = (
  fuel: FuelPeriodSummary[],
  maintenance: MaintenancePeriodSummary[],
  labels: {
    title: string;
    fuel: string;
    maintenance: string;
  }
): ChartSpec | null => {
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

  return {
    kind: 'grouped_bar',
    title: labels.title,
    xAxis: { type: 'category', format: 'text' },
    yAxis: { format: 'money' },
    series: [
      {
        key: 'fuel',
        label: labels.fuel,
        tone: 'fuel',
        points: rows.map((row) => ({
          x: row.label,
          y: fuelByKey.get(row.key)?.totalCostCents ?? 0,
        })),
      },
      {
        key: 'maintenance',
        label: labels.maintenance,
        tone: 'maintenance',
        points: rows.map((row) => ({
          x: row.label,
          y: maintenanceByKey.get(row.key)?.totalCostCents ?? 0,
        })),
      },
    ],
  };
};

export const buildMonthlySpendChart = (
  entries: { date: number; total_cost: number | null }[],
  title: string
): ChartSpec | null => {
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

  return {
    kind: 'bar',
    title,
    xAxis: { type: 'category', format: 'text' },
    yAxis: { format: 'money' },
    series: [
      {
        key: 'monthly',
        label: title,
        tone: 'fuel',
        points: rows.map((row) => ({
          x: row.label,
          y: Math.round(row.total * 100),
        })),
      },
    ],
  };
};
