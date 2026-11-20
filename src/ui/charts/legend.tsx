import React from 'react';
import { View } from 'react-native';

import type { ChartSeries, ChartSpec } from '@/src/domain/charts/types';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row } from '@/src/ui/primitives/Stack';
import { chartSeriesColor, PIE_TONES } from './theme';

export const legendSeriesForSpec = (
  spec: ChartSpec | null
): ChartSeries[] => {
  if (!spec) return [];
  if (spec.kind !== 'pie' && spec.kind !== 'donut') return spec.series;
  return (spec.series[0]?.points ?? []).map((point, index) => ({
    key: String(point.x),
    label: String(point.x),
    tone: point.tone ?? PIE_TONES[index % PIE_TONES.length],
    points: [],
  }));
};

type ChartLegendProps = {
  series: readonly ChartSeries[];
  compact?: boolean;
};

export const ChartLegend = ({ series, compact = false }: ChartLegendProps) => {
  const { colors } = useTheme();
  if (series.length === 0) return null;

  return (
    <Row gap={compact ? 'sm' : 'md'} wrap>
      {series.map((item, index) => (
        <Row key={`${item.key}-${index}`} gap='xs' align='center'>
          <View
            style={{
              width: compact ? 8 : 10,
              height: compact ? 8 : 10,
              borderRadius: 2,
              backgroundColor: chartSeriesColor(item.tone, index, colors),
            }}
          />
          <AppText variant='caption' color='muted'>
            {item.label}
          </AppText>
        </Row>
      ))}
    </Row>
  );
};
