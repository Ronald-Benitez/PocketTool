import type { ConsumptionFormat, FuelEntryAnalysis } from './types';
import type {
  FuelPeriodSummary,
  MaintenancePeriodSummary,
} from './history';
import { consumptionUnits, selectConsumption } from './units';

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
    .filter((point): point is { date: number; value: number } => point.value != null)
    .slice(-6);

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

export const buildPeriodSpendChart = (
  rows: FuelPeriodSummary[],
  title: string,
  limit = 6
) => {
  const periodRows = rows.slice(-limit);
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
  },
  limit = 6
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
  const rows = [...keys.values()]
    .sort((a, b) => a.sort - b.sort)
    .slice(-limit);
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
  entries: { date: number; total_cost: number }[],
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
    current.total += entry.total_cost / 100;
    months.set(key, current);
  }
  const rows = [...months.values()].sort((a, b) => a.sort - b.sort).slice(-12);
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
