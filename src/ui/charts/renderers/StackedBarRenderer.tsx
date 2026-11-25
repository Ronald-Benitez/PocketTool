import React from 'react';
import { G, Rect } from 'react-native-svg';

import { linearScale } from '@/src/domain/charts/scale';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { ChartFrame } from '../ChartFrame';
import { chartSeriesColor } from '../theme';
import type { ChartRendererProps } from '../types';
import { prepareCategoryChart, stackedTotals } from './shared';

export const StackedBarRenderer = ({
  spec,
  width,
  height,
  language,
  onPointPress,
  activeKey,
}: ChartRendererProps) => {
  const { colors } = useTheme();
  const totals = stackedTotals(spec);
  const geometry = prepareCategoryChart(
    { ...spec, series: [totals] },
    width,
    height,
    true
  );
  const yScale = linearScale(geometry.yDomain, [
    geometry.plot.bottom,
    geometry.plot.top,
  ]);
  const barrierWidth = geometry.band.bandwidth * 0.62;

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
          {geometry.categories.map((category, categoryIndex) => {
            let cumulative = 0;
            const x = geometry.band.center(categoryIndex) - barrierWidth / 2;
            return (
              <G key={category}>
                {spec.series.map((series, seriesIndex) => {
                  const point = series.points.find(
                    (candidate) => String(candidate.x) === category
                  );
                  const value = Math.max(0, point?.y ?? 0);
                  if (value <= 0) return null;
                  const bottom = yScale.value(cumulative);
                  cumulative += value;
                  const top = yScale.value(cumulative);
                  const barHeight = Math.max(1, bottom - top);
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
                      width={barrierWidth}
                      height={barHeight}
                      fill={color}
                      opacity={activeKey === key ? 1 : 0.9}
                      onPress={() => {
                        const entries = spec.series.flatMap(
                          (candidate, candidateIndex) => {
                            const candidatePoint = candidate.points.find(
                              (item) => String(item.x) === category
                            );
                            const candidateValue = Math.max(
                              0,
                              candidatePoint?.y ?? 0
                            );
                            if (candidateValue <= 0) return [];
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
                          x: x + barrierWidth / 2,
                          y: top,
                          color,
                          entries,
                        });
                      }}
                    />
                  );
                })}
              </G>
            );
          })}
        </G>
      )}
    </ChartFrame>
  );
};
