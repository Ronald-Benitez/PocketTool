export type ChartKind =
  | 'line'
  | 'bar'
  | 'grouped_bar'
  | 'stacked_bar'
  | 'pie'
  | 'donut'
  | 'area';

export type ChartTone =
  | 'planned'
  | 'actual'
  | 'projected'
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'fuel'
  | 'maintenance'
  | 'consumption'
  | 'distance'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type ChartValueFormat =
  | 'money'
  | 'currency_units'
  | 'currency'
  | 'number'
  | 'percent'
  | 'index'
  | 'unit';

export type ChartPoint = {
  /** Timestamp, index or category label. */
  x: number | string;
  /** Cents when the axis format is `money`; raw units otherwise. */
  y: number | null;
  /** Optional per-point tone, used by pie/donut slices. */
  tone?: ChartTone;
  /** Optional real value shown in tooltips when `y` is normalized. */
  tooltipValue?: number | null;
  tooltipFormat?: ChartValueFormat;
  tooltipUnit?: string | null;
};

export type ChartSeries = {
  key: string;
  label: string;
  tone: ChartTone;
  points: ChartPoint[];
};

export type ChartXAxis = {
  type: 'time' | 'category' | 'index';
  label?: string;
  format?: 'date' | 'month' | 'text';
};

export type ChartYAxis = {
  label?: string;
  format: ChartValueFormat;
  unit?: string;
  min?: number;
  max?: number;
};

export type ChartSpec = {
  kind: ChartKind;
  title?: string;
  series: ChartSeries[];
  xAxis?: ChartXAxis;
  yAxis?: ChartYAxis;
  stacked?: boolean;
  showValues?: boolean;
  emptyLabel?: string;
};

export type ChartSpecInput = Omit<ChartSpec, 'series'> & {
  series: ChartSeries[];
};

export type ChartRendererId = ChartKind;
