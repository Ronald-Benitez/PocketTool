import type { ChartKind, ChartSpec } from './types';

export const CHART_KINDS: ChartKind[] = [
  'line',
  'bar',
  'grouped_bar',
  'stacked_bar',
  'pie',
  'donut',
  'area',
];

export type ChartSpecError = {
  path: string;
  message: string;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const validateChartSpec = (spec: ChartSpec | null): ChartSpecError[] => {
  if (!spec) return [];
  const errors: ChartSpecError[] = [];

  if (!CHART_KINDS.includes(spec.kind)) {
    errors.push({ path: 'kind', message: 'Unsupported chart kind' });
  }
  if (!Array.isArray(spec.series) || spec.series.length === 0) {
    errors.push({ path: 'series', message: 'At least one series is required' });
  }

  spec.series?.forEach((series, seriesIndex) => {
    if (!series.key) {
      errors.push({
        path: `series.${seriesIndex}.key`,
        message: 'Series key is required',
      });
    }
    if (!Array.isArray(series.points)) {
      errors.push({
        path: `series.${seriesIndex}.points`,
        message: 'Series points must be an array',
      });
      return;
    }
    series.points.forEach((point, pointIndex) => {
      if (
        typeof point.x !== 'string' &&
        !isFiniteNumber(point.x)
      ) {
        errors.push({
          path: `series.${seriesIndex}.points.${pointIndex}.x`,
          message: 'X must be a string or finite number',
        });
      }
      if (point.y !== null && !isFiniteNumber(point.y)) {
        errors.push({
          path: `series.${seriesIndex}.points.${pointIndex}.y`,
          message: 'Y must be a finite number or null',
        });
      }
    });
  });

  if (
    (spec.kind === 'pie' || spec.kind === 'donut') &&
    spec.series.some((series) =>
      series.points.some((point) => (point.y ?? 0) < 0)
    )
  ) {
    errors.push({
      path: 'series',
      message: 'Pie charts do not support negative values',
    });
  }

  return errors;
};

export const assertChartSpec = (spec: ChartSpec | null): ChartSpec | null => {
  const errors = validateChartSpec(spec);
  if (errors.length > 0) {
    throw new Error(
      `Invalid chart spec: ${errors.map((error) => error.path).join(', ')}`
    );
  }
  return spec;
};

export const specHasData = (spec: ChartSpec | null | undefined): boolean =>
  Boolean(
    spec &&
      spec.series.some((series) =>
        series.points.some((point) => isFiniteNumber(point.y))
      )
  );

export const totalForPie = (spec: ChartSpec): number =>
  spec.series.reduce(
    (total, series) =>
      total +
      series.points.reduce(
        (sum, point) => sum + Math.max(0, point.y ?? 0),
        0
      ),
    0
  );

export const seriesLabel = (
  spec: ChartSpec,
  key: string
): string => spec.series.find((series) => series.key === key)?.label ?? key;
