import type { ChartKind } from '@/src/domain/charts/types';
import { AreaRenderer } from './renderers/AreaRenderer';
import { BarRenderer } from './renderers/BarRenderer';
import { GroupedBarRenderer } from './renderers/GroupedBarRenderer';
import { LineRenderer } from './renderers/LineRenderer';
import { DonutRenderer, PieRenderer } from './renderers/PieBase';
import { StackedBarRenderer } from './renderers/StackedBarRenderer';
import type { ChartRenderer, ChartRendererRegistry } from './types';

export const CHART_RENDERERS: ChartRendererRegistry = {
  line: LineRenderer,
  bar: BarRenderer,
  grouped_bar: GroupedBarRenderer,
  stacked_bar: StackedBarRenderer,
  pie: PieRenderer,
  donut: DonutRenderer,
  area: AreaRenderer,
};

export const getChartRenderer = (kind: ChartKind): ChartRenderer =>
  CHART_RENDERERS[kind] ?? LineRenderer;

export const CHART_KINDS = Object.keys(CHART_RENDERERS) as ChartKind[];
