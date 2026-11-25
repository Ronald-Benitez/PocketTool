import type { ThemeColorTokens } from '@/src/interfaces/colors';
import type { ChartTone } from '@/src/domain/charts/types';

const FALLBACK_TONES: ChartTone[] = [
  'planned',
  'actual',
  'projected',
  'primary',
  'secondary',
  'info',
  'warning',
  'danger',
];

export const PIE_TONES = FALLBACK_TONES;

export const chartToneColor = (
  tone: ChartTone,
  colors: ThemeColorTokens
): string => {
  switch (tone) {
    case 'planned':
      return colors.chartPlanned;
    case 'actual':
      return colors.chartActual;
    case 'projected':
      return colors.chartProjected;
    case 'fuel':
      return colors.chartFuelCost;
    case 'maintenance':
      return colors.chartMaintenanceCost;
    case 'consumption':
      return colors.chartConsumption;
    case 'distance':
      return colors.chartDistance;
    case 'primary':
      return colors.primary;
    case 'secondary':
      return colors.secondary;
    case 'muted':
      return colors.textMuted;
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'danger':
      return colors.danger;
    case 'info':
      return colors.info;
    default:
      return colors.chartPlanned;
  }
};

export const fallbackChartTone = (
  index: number,
  colors: ThemeColorTokens
): string => {
  const tone = FALLBACK_TONES[index % FALLBACK_TONES.length];
  return chartToneColor(tone, colors);
};

export const chartSeriesColor = (
  tone: ChartTone,
  index: number,
  colors: ThemeColorTokens
) => (tone ? chartToneColor(tone, colors) : fallbackChartTone(index, colors));
