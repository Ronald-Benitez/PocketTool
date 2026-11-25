import type { ChartValueFormat, ChartXAxis } from '@/src/domain/charts/types';
import { formatMoneyWithSymbol } from '@/src/utils';

const compactNumber = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  if (abs >= 100) return String(Math.round(value));
  if (abs >= 10) return value.toFixed(1).replace(/\.0$/, '');
  return value.toFixed(2).replace(/\.?0+$/, '');
};

export const formatChartValue = (
  value: number,
  format: ChartValueFormat,
  unit?: string | null,
  compact = false
): string => {
  if (!Number.isFinite(value)) return '—';
  if (format === 'money') {
    return compact
      ? `$${compactNumber(value / 100)}`
      : formatMoneyWithSymbol(Math.round(value));
  }
  if (format === 'currency_units') {
    return compact
      ? `$${compactNumber(value)}${unit ?? ''}`
      : `${formatMoneyWithSymbol(Math.round(value * 100))}${unit ?? ''}`;
  }
  if (format === 'currency') {
    return compact
      ? `$${compactNumber(value / 100)}${unit ?? ''}`
      : `${formatMoneyWithSymbol(Math.round(value))}${unit ?? ''}`;
  }
  if (format === 'percent') return `${Math.round(value)}%`;
  if (format === 'index') return compact ? compactNumber(value) : String(Math.round(value));
  if (format === 'unit') {
    const formatted = compact
      ? compactNumber(value)
      : value.toFixed(2).replace(/\.?0+$/, '');
    return unit ? `${formatted} ${unit}` : formatted;
  }
  return compact ? compactNumber(value) : String(Math.round(value));
};

export const formatChartTooltipValue = (
  value: number,
  format: ChartValueFormat,
  unit?: string | null
) => formatChartValue(value, format, unit, false);

const shortDate = (value: number, language: string, withYear: boolean) =>
  new Date(value).toLocaleDateString(language, {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' as const } : {}),
  });

export const formatChartXValue = (
  value: string | number,
  axis: ChartXAxis | undefined,
  language: string,
  spanMs = 0
): string => {
  const numeric = typeof value === 'number' ? value : Number(value);
  const wantsDate =
    axis?.type === 'time' ||
    axis?.format === 'date' ||
    axis?.format === 'month';
  if (!wantsDate || !Number.isFinite(numeric)) {
    return String(value);
  }
  if (axis?.format === 'month') {
    return new Date(numeric).toLocaleDateString(language, {
      month: 'short',
      year: '2-digit',
    });
  }
  return shortDate(numeric, language, spanMs > 366 * 24 * 60 * 60 * 1000);
};

export const ellipsize = (value: string, maxChars: number): string => {
  if (maxChars <= 1) return '…';
  const chars = Array.from(value);
  return chars.length > maxChars
    ? `${chars.slice(0, Math.max(1, maxChars - 1)).join('')}…`
    : value;
};
