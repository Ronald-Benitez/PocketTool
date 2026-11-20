import React from 'react';
import { G, Rect, Text as SvgText } from 'react-native-svg';

import { linearScale } from '@/src/domain/charts/scale';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { ChartFrame } from '../ChartFrame';
import { formatChartValue } from '../format';
import { chartSeriesColor } from '../theme';
import type { ChartRendererProps } from '../types';
import { prepareCategoryChart } from './shared';

export const GroupedBarRenderer = ({
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
  const seriesCount = Math.max(1, spec.series.length);
  const groupWidth = geometry.band.bandwidth * 0.82;
  const barWidth = groupWidth / seriesCount;

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
          {geometry.categories.map((category, categoryIndex) => (
            <G key={category}>
              {spec.series.map((series, seriesIndex) => {
                const value =
                  geometry.values.find((row) => row.series.key === series.key)
                    ?.values[categoryIndex] ?? null;
                if (value == null) return null;
                const x =
                  geometry.band.center(categoryIndex) -
                  groupWidth / 2 +
                  seriesIndex * barWidth;
                const y = yScale.value(value);
                const top = Math.min(y, zero);
                const barHeight = Math.max(1, Math.abs(zero - y));
                const key = `${series.key}:${category}`;
                const color = chartSeriesColor(
                  series.tone,
                  seriesIndex,
                  colors
                );
                return (
                  <Rect
                    key={key}
                    x={x}
                    y={top}
                    width={Math.max(1, barWidth - 2)}
                    height={barHeight}
                    rx={2}
                    fill={color}
                    opacity={activeKey === key ? 1 : 0.9}
                    onPress={() => {
                      const entries = spec.series.flatMap(
                        (candidate, candidateIndex) => {
                          const candidateValue =
                            geometry.values.find(
                              (row) => row.series.key === candidate.key
                            )?.values[categoryIndex] ?? null;
                          if (candidateValue == null) return [];
                          return [
                            {
                              seriesKey: candidate.key,
                              seriesLabel: candidate.label,
                              value: candidateValue,
                              color: chartSeriesColor(
                                candidate.tone,
                                candidateIndex,
                                colors
                              ),
                            },
                          ];
                        }
                      );
                      onPointPress({
                        key,
                        seriesKey: series.key,
                        seriesLabel: series.label,
                        label: category,
                        value,
                        x: x + barWidth / 2,
                        y,
                        color,
                        entries,
                      });
                    }}
                  />
                );
              })}
            </G>
          ))}
          {spec.showValues && geometry.categories.length <= 6
            ? spec.series.map((series, seriesIndex) =>
                geometry.values
                  .find((row) => row.series.key === series.key)
                  ?.values.map((value, categoryIndex) => {
                    if (value == null) return null;
                    const x =
                      geometry.band.center(categoryIndex) -
                      groupWidth / 2 +
                      seriesIndex * barWidth +
                      barWidth / 2;
                    const y = yScale.value(value);
                    return (
                      <SvgText
                        key={`value-${series.key}-${categoryIndex}`}
                        x={x}
                        y={Math.min(y, zero) - 5}
                        fill={colors.textMuted}
                        fontSize={8}
                        textAnchor='middle'
                      >
                        {formatChartValue(value, format, unit, true)}
                      </SvgText>
                    );
                  })
              )
            : null}
        </G>
      )}
    </ChartFrame>
  );
};
