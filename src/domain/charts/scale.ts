import type { ChartSeries, ChartSpec } from './types';

export type LinearScale = {
  domain: [number, number];
  range: [number, number];
  value: (value: number) => number;
};

export type BandScale = {
  count: number;
  step: number;
  bandwidth: number;
  start: (index: number) => number;
  center: (index: number) => number;
};

const finite = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Nice rounded step used by the tick algorithm. */
const niceNumber = (value: number, round: boolean) => {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * 10 ** exponent;
};

export const chartValueDomain = (
  series: readonly ChartSeries[],
  includeZero = true
): [number, number] => {
  let min = Infinity;
  let max = -Infinity;
  for (const item of series) {
    for (const point of item.points) {
      if (!finite(point.y)) continue;
      min = Math.min(min, point.y);
      max = Math.max(max, point.y);
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }
  if (min === max) {
    if (min === 0) return [0, 1];
    const padding = Math.abs(min) * 0.1;
    return [min - padding, max + padding];
  }
  return [min, max];
};

export const niceTicks = (
  min: number,
  max: number,
  count = 4
): { min: number; max: number; ticks: number[] } => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || count < 2) {
    return { min: 0, max: 1, ticks: [0, 0.5, 1] };
  }
  if (min === max) {
    if (min === 0) return { min: 0, max: 1, ticks: [0, 0.5, 1] };
    const padding = Math.abs(min) * 0.1;
    min -= padding;
    max += padding;
  }

  const step = niceNumber((max - min) / (count - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = niceMin; value <= niceMax + step * 0.5; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return { min: niceMin, max: niceMax, ticks };
};

export const linearScale = (
  domain: [number, number],
  range: [number, number]
): LinearScale => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  return {
    domain,
    range,
    value: (value: number) => {
      if (!Number.isFinite(value) || span === 0) return (r0 + r1) / 2;
      return r0 + ((value - d0) / span) * (r1 - r0);
    },
  };
};

export const bandScale = (
  count: number,
  rangeMin: number,
  rangeMax: number,
  paddingInner = 0.2,
  paddingOuter = 0.1
): BandScale => {
  const safeCount = Math.max(1, Math.floor(count));
  const total = Math.max(0, rangeMax - rangeMin);
  const step = total / safeCount;
  const bandwidth = step * (1 - paddingInner);
  const first = rangeMin + step * paddingOuter + (step - bandwidth) / 2;
  return {
    count: safeCount,
    step,
    bandwidth,
    start: (index: number) => first + index * step,
    center: (index: number) => first + index * step + bandwidth / 2,
  };
};

export const categoryLabels = (spec: ChartSpec): string[] => {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const series of spec.series) {
    for (const point of series.points) {
      const label = String(point.x);
      if (seen.has(label)) continue;
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
};

export const valuesForCategories = (
  series: ChartSeries,
  categories: readonly string[]
): (number | null)[] => {
  const byCategory = new Map<string, number | null>();
  for (const point of series.points) {
    byCategory.set(String(point.x), finite(point.y) ? point.y : null);
  }
  return categories.map((category) => byCategory.get(category) ?? null);
};

export const timeDomain = (series: readonly ChartSeries[]): [number, number] => {
  let min = Infinity;
  let max = -Infinity;
  for (const item of series) {
    for (const point of item.points) {
      if (typeof point.x !== 'number' || !Number.isFinite(point.x)) continue;
      min = Math.min(min, point.x);
      max = Math.max(max, point.x);
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  return [min, max];
};

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
