import type { ComponentType } from 'react';

import type {
  ChartKind,
  ChartSpec,
  ChartValueFormat,
} from '@/src/domain/charts/types';

export type ChartTooltipEntry = {
  seriesKey: string;
  seriesLabel: string;
  value: number;
  color: string;
  /** Real value when the plotted value is normalized. */
  secondaryValue?: number | null;
  secondaryFormat?: ChartValueFormat;
  secondaryUnit?: string | null;
};

export type ChartActivePoint = {
  key: string;
  seriesKey: string;
  seriesLabel: string;
  label: string;
  value: number;
  x: number;
  y: number;
  color: string;
  /** All series at the same x/category, when available. */
  entries?: ChartTooltipEntry[];
};

export type ChartRendererProps = {
  spec: ChartSpec;
  width: number;
  height: number;
  language: string;
  onPointPress: (point: ChartActivePoint) => void;
  activeKey?: string | null;
};

export type ChartRenderer = ComponentType<ChartRendererProps>;

export type ChartRendererRegistry = Record<ChartKind, ChartRenderer>;
