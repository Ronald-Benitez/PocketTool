import React from 'react';
import { G, Rect, Text as SvgText } from 'react-native-svg';

import { linearScale } from '@/src/domain/charts/scale';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { ChartFrame } from '../ChartFrame';
import { formatChartValue } from '../format';
import { chartSeriesColor } from '../theme';
import type { ChartRendererProps } from '../types';
import { prepareCategoryChart } from './shared';

export const BarRenderer = ({
  spec,
  width,
  height,
  language,
  onPointPress,
  activeKey,
}: ChartRendererProps) => {
  const { colors } = useTheme();
  const geometry = prepareCategoryChart(spec, width, height, true);
  const yScale = linearScale(geometry.yDomain, [
    geometry.plot.bottom,
    geometry.plot.top,
  ]);
  const zero = yScale.value(0);
  const format = spec.yAxis?.format ?? 'number';
  const unit = spec.yAxis?.unit;
  const series = spec.series[0];
  if (!series) return null;
  const values =
    geometry.values.find((row) => row.series.key === series.key)?.values ?? [];
  const color = chartSeriesColor(series.tone, 0, colors);
  const barWidth = geometry.band.bandwidth * 0.62;

  return (
    <ChartFrame
      width={width}
      height={height}
      spec={spec}
      yDomain={geometry.yDomain}
      yTicks={geometry.yTicks}
      xLabels={geometry.xLabels}
      xPositions={geometry.xPositions}
      language={language}
    >
      {() => (
        <G>
          {values.map((value, index) => {
            if (value == null) return null;
            const x = geometry.band.center(index) - barWidth / 2;
            const y = yScale.value(value);
            const top = Math.min(y, zero);
            const barHeight = Math.max(1, Math.abs(zero - y));
            const key = `${series.key}:${geometry.categories[index]}`;
            return (
              <G key={key}>
                <Rect
                  x={x}
                  y={top}
                  width={barWidth}
                  height={barHeight}
                  rx={3}
                  fill={color}
                  opacity={activeKey === key ? 1 : 0.88}
                  onPress={() =>
                    onPointPress({
                      key,
                      seriesKey: series.key,
                      seriesLabel: series.label,
                      label: geometry.categories[index],
                      value,
                      x: geometry.band.center(index),
                      y,
                      color,
                    })
                  }
                />
                {spec.showValues && values.length <= 10 ? (
                  <SvgText
                    x={geometry.band.center(index)}
                    y={top - 6}
                    fill={colors.textMuted}
                    fontSize={9}
                    textAnchor='middle'
                  >
                    {formatChartValue(value, format, unit, true)}
                  </SvgText>
                ) : null}
              </G>
            );
          })}
        </G>
      )}
    </ChartFrame>
  );
};
