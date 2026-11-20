import type { ChartPoint, ChartSpec, ChartTone } from '@/src/domain/charts/types';
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

const topExpenseLines = (view: BudgetPlanView) =>
  view.lines
    .filter((line) => line.effect === '-')
    .sort((a, b) => b.plannedCents - a.plannedCents);

const lineLabel = (line: BudgetPlanView['lines'][number]) =>
  line.categoryName || line.typeName || '—';

const distributionTones: ChartTone[] = [
  'planned',
  'actual',
  'projected',
  'primary',
  'secondary',
  'info',
  'warning',
  'danger',
];

export const buildBudgetHealthPie = (
  view: BudgetPlanView,
  labels: BudgetChartLabels
): ChartSpec | null => {
  const lines = view.lines.filter((line) => line.effect === '-');
  if (lines.length === 0) return null;

  const allCounts: { label: string; value: number; tone: ChartTone }[] = [
    {
      label: labels.onTrack,
      value: lines.filter((line) => line.status === 'on_track').length,
      tone: 'success',
    },
    {
      label: labels.warning,
      value: lines.filter((line) => line.status === 'warning').length,
      tone: 'warning',
    },
    {
      label: labels.over,
      value: lines.filter((line) => line.status === 'over').length,
      tone: 'danger',
    },
    {
      label: labels.fixedPending,
      value: lines.filter((line) => line.status === 'fixed_pending').length,
      tone: 'info',
    },
  ];
  const counts = allCounts.filter((entry) => entry.value > 0);

  if (counts.length === 0) return null;

  return {
    kind: 'pie',
    title: labels.healthTitle,
    series: [
      {
        key: 'health',
        label: labels.healthTitle,
        tone: 'primary',
        points: counts.map<ChartPoint>((entry) => ({
          x: entry.label,
          y: entry.value,
          tone: entry.tone,
        })),
      },
    ],
    yAxis: { format: 'number' },
    showValues: true,
  };
};

export const buildBudgetDistributionPie = (
  view: BudgetPlanView,
  labels: BudgetChartLabels
): ChartSpec | null => {
  const lines = topExpenseLines(view);
  const total = lines.reduce((sum, line) => sum + line.plannedCents, 0);
  if (lines.length === 0 || total <= 0) return null;

  return {
    kind: 'pie',
    title: labels.distributionTitle,
    series: [
      {
        key: 'distribution',
        label: labels.distributionTitle,
        tone: 'planned',
        points: lines.map<ChartPoint>((line, index) => ({
          x: lineLabel(line),
          y: line.plannedCents,
          tone: distributionTones[index % distributionTones.length],
        })),
      },
    ],
    yAxis: { format: 'money' },
    showValues: true,
  };
};

export const buildBudgetComparisonChart = (
  view: BudgetPlanView,
  labels: BudgetChartLabels
): ChartSpec | null => {
  const lines = topExpenseLines(view);
  if (lines.length === 0) return null;

  return {
    kind: 'grouped_bar',
    title: labels.comparisonTitle,
    xAxis: { type: 'category', format: 'text' },
    yAxis: { format: 'money' },
    series: [
      {
        key: 'planned',
        label: labels.planned,
        tone: 'planned',
        points: lines.map((line) => ({
          x: lineLabel(line),
          y: line.plannedCents,
        })),
      },
      {
        key: 'actual',
        label: labels.actual,
        tone: 'actual',
        points: lines.map((line) => ({
          x: lineLabel(line),
          y: line.actualCents,
        })),
      },
    ],
  };
};

export const buildBudgetProjectionChart = (
  view: BudgetPlanView,
  labels: BudgetChartLabels
): ChartSpec | null => {
  const lines = topExpenseLines(view).filter(
    (line) => line.projectedCents !== null
  );
  if (lines.length === 0) return null;

  return {
    kind: 'grouped_bar',
    title: labels.projectionTitle,
    xAxis: { type: 'category', format: 'text' },
    yAxis: { format: 'money' },
    series: [
      {
        key: 'planned',
        label: labels.planned,
        tone: 'planned',
        points: lines.map((line) => ({
          x: lineLabel(line),
          y: line.plannedCents,
        })),
      },
      {
        key: 'projected',
        label: labels.projected,
        tone: 'projected',
        points: lines.map((line) => ({
          x: lineLabel(line),
          y: line.projectedCents ?? 0,
        })),
      },
    ],
  };
};

export const buildBudgetCharts = (view: BudgetPlanView, labels: BudgetChartLabels) => ({
  health: buildBudgetHealthPie(view, labels),
  distribution: buildBudgetDistributionPie(view, labels),
  comparison: buildBudgetComparisonChart(view, labels),
  projection: buildBudgetProjectionChart(view, labels),
});
