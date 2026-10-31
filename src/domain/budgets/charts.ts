import type { BudgetPlanView } from './types';

export type BudgetChartLabels = {
  healthTitle: string;
  distributionTitle: string;
  comparisonTitle: string;
  projectionTitle: string;
  planned: string;
  actual: string;
  projected: string;
  spent: string;
  remaining: string;
  onTrack: string;
  warning: string;
  over: string;
  fixedPending: string;
};

const clean = (value: string, fallback: string) => {
  const normalized = value
    .replace(/["[\]{}();\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return fallback;
  return normalized.length > 16 ? `${normalized.slice(0, 13)}...` : normalized;
};

const moneyLabel = (cents: number) => Math.round(cents) / 100;

const topExpenseLines = (view: BudgetPlanView) =>
  view.lines
    .filter((line) => line.effect === '-')
    .sort((a, b) => b.plannedCents - a.plannedCents);

export const buildBudgetHealthPie = (
  view: BudgetPlanView,
  labels: BudgetChartLabels
): string | null => {
  const lines = view.lines.filter((line) => line.effect === '-');
  if (lines.length === 0) return null;

  const counts = {
    onTrack: lines.filter((line) => line.status === 'on_track').length,
    warning: lines.filter((line) => line.status === 'warning').length,
    over: lines.filter((line) => line.status === 'over').length,
    fixedPending: lines.filter((line) => line.status === 'fixed_pending').length,
  };

  const entries = [
    [labels.onTrack, counts.onTrack],
    [labels.warning, counts.warning],
    [labels.over, counts.over],
    [labels.fixedPending, counts.fixedPending],
  ].filter(([, value]) => Number(value) > 0);

  if (entries.length === 0) return null;

  return [
    'pie showData',
    `  title ${clean(labels.healthTitle, labels.healthTitle)}`,
    ...entries.map(([label, value]) => `  "${clean(String(label), '—')}" : ${value}`),
  ].join('\n');
};

export const buildBudgetDistributionPie = (
  view: BudgetPlanView,
  labels: BudgetChartLabels
): string | null => {
  const lines = topExpenseLines(view);
  const total = lines.reduce((sum, line) => sum + line.plannedCents, 0);
  if (lines.length === 0 || total <= 0) return null;

  return [
    'pie showData',
    `  title ${clean(labels.distributionTitle, labels.distributionTitle)}`,
    ...lines.map(
      (line) =>
        `  "${clean(
          line.categoryName || line.typeName,
          '—'
        )}" : ${moneyLabel(line.plannedCents)}`
    ),
  ].join('\n');
};

export const buildBudgetComparisonChart = (
  view: BudgetPlanView,
  labels: BudgetChartLabels
): string | null => {
  const lines = topExpenseLines(view);
  if (lines.length === 0) return null;

  const planned = lines.map((line) => moneyLabel(line.plannedCents));
  const actual = lines.map((line) => moneyLabel(line.actualCents));
  const max = Math.max(...planned, ...actual, 1);
  const axisMax = Math.ceil(max * 1.15);

  return [
    'xychart-beta',
    `  title "${clean(labels.comparisonTitle, labels.comparisonTitle)}"`,
    `  x-axis [${lines
      .map((line) => `"${clean(line.categoryName || line.typeName, '—')}"`)
      .join(', ')}]`,
    `  y-axis "${clean(labels.planned, labels.planned)} / ${clean(
      labels.actual,
      labels.actual
    )}" 0 --> ${axisMax}`,
    `  bar [${planned.join(', ')}]`,
    `  bar [${actual.join(', ')}]`,
  ].join('\n');
};

export const buildBudgetProjectionChart = (
  view: BudgetPlanView,
  labels: BudgetChartLabels
): string | null => {
  const lines = topExpenseLines(view).filter((line) => line.projectedCents !== null);
  if (lines.length === 0) return null;

  const planned = lines.map((line) => moneyLabel(line.plannedCents));
  const projected = lines.map((line) => moneyLabel(line.projectedCents ?? 0));
  const max = Math.max(...planned, ...projected, 1);
  const axisMax = Math.ceil(max * 1.15);

  return [
    'xychart-beta',
    `  title "${clean(labels.projectionTitle, labels.projectionTitle)}"`,
    `  x-axis [${lines
      .map((line) => `"${clean(line.categoryName || line.typeName, '—')}"`)
      .join(', ')}]`,
    `  y-axis "${clean(labels.planned, labels.planned)} / ${clean(
      labels.projected,
      labels.projected
    )}" 0 --> ${axisMax}`,
    `  bar [${planned.join(', ')}]`,
    `  bar [${projected.join(', ')}]`,
  ].join('\n');
};

export const buildBudgetCharts = (view: BudgetPlanView, labels: BudgetChartLabels) => ({
  health: buildBudgetHealthPie(view, labels),
  distribution: buildBudgetDistributionPie(view, labels),
  comparison: buildBudgetComparisonChart(view, labels),
  projection: buildBudgetProjectionChart(view, labels),
});
