import type { ChartSeries, ChartSpec } from '@/src/domain/charts/types';
import {
  bandScale,
  categoryLabels,
  chartValueDomain,
  linearScale,
  niceTicks,
  timeDomain,
  valuesForCategories,
} from '@/src/domain/charts/scale';
import { chartPlot, type ChartPlot } from '../ChartFrame';

export type CategoryGeometry = {
  plot: ChartPlot;
  categories: string[];
  band: ReturnType<typeof bandScale>;
  values: { series: ChartSeries; values: (number | null)[] }[];
  yDomain: [number, number];
  yTicks: number[];
  xPositions: number[];
  xLabels: string[];
};

export const prepareCategoryChart = (
  spec: ChartSpec,
  width: number,
  height: number,
  includeZero = true
): CategoryGeometry => {
  const plot = chartPlot(width, height);
  const categories = categoryLabels(spec);
  const band = bandScale(categories.length, plot.left, plot.right, 0.25, 0.08);
  const values = spec.series.map((series) => ({
    series,
    values: valuesForCategories(series, categories),
  }));
  const domain = chartValueDomain(spec.series, includeZero);
  const ticks = niceTicks(
    spec.yAxis?.min ?? domain[0],
    spec.yAxis?.max ?? domain[1],
    4
  );
  return {
    plot,
    categories,
    band,
    values,
    yDomain: [ticks.min, ticks.max],
    yTicks: ticks.ticks,
    xPositions: categories.map((_, index) => band.center(index)),
    xLabels: categories,
  };
};

export type TimeGeometry = {
  plot: ChartPlot;
  xDomain: [number, number];
  xScale: ReturnType<typeof linearScale>;
  yDomain: [number, number];
  yTicks: number[];
  xPositions: number[];
  xLabels: number[];
};

export const prepareTimeChart = (
  spec: ChartSpec,
  width: number,
  height: number,
  includeZero = true
): TimeGeometry => {
  const plot = chartPlot(width, height);
  const xDomain = timeDomain(spec.series);
  const yDomainRaw = chartValueDomain(spec.series, includeZero);
  const ticks = niceTicks(
    spec.yAxis?.min ?? yDomainRaw[0],
    spec.yAxis?.max ?? yDomainRaw[1],
    4
  );
  const tickCount = 5;
  const xLabels = Array.from({ length: tickCount }, (_, index) =>
    xDomain[0] + ((xDomain[1] - xDomain[0]) * index) / (tickCount - 1)
  );
  return {
    plot,
    xDomain,
    xScale: linearScale(xDomain, [plot.left, plot.right]),
    yDomain: [ticks.min, ticks.max],
    yTicks: ticks.ticks,
    xPositions: xLabels.map((value) => linearScale(xDomain, [plot.left, plot.right]).value(value)),
    xLabels,
  };
};

export const stackedTotals = (spec: ChartSpec): ChartSeries => ({
  key: 'stacked-total',
  label: 'total',
  tone: 'primary',
  points: categoryLabels(spec).map((category) => ({
    x: category,
    y: spec.series.reduce((total, series) => {
      const point = series.points.find(
        (candidate) => String(candidate.x) === category
      );
      return total + Math.max(0, point?.y ?? 0);
    }, 0),
  })),
});

export const buildLinePath = (
  points: [number, number][],
  smooth = true
): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  if (!smooth) {
    return points
      .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
      .join(' ');
  }

  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return path;
};

export const linePoints = (
  spec: ChartSpec,
  geometry: { plot: ChartPlot; xScale: (value: number) => number; yScale: (value: number) => number },
  series: ChartSeries
): [number, number][] =>
  [...series.points]    .filter((point) => typeof point.x === 'number' && Number.isFinite(point.y))
    .sort((left, right) => Number(left.x) - Number(right.x))
    .map((point) => [
      geometry.xScale(Number(point.x)),
      geometry.yScale(point.y as number),
    ]);
