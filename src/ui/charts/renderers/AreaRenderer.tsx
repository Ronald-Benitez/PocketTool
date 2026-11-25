import React from 'react';
import { G, Path } from 'react-native-svg';

import { linearScale } from '@/src/domain/charts/scale';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { ChartFrame } from '../ChartFrame';
import { chartSeriesColor } from '../theme';
import type { ChartRendererProps } from '../types';
import {
  buildLinePath,
  prepareCategoryChart,
  prepareTimeChart,
} from './shared';

export const AreaRenderer = ({
  spec,
  width,
  height,
  language,
}: ChartRendererProps) => {
  const { colors } = useTheme();
  const isTime = spec.xAxis?.type === 'time';
  const category = prepareCategoryChart(spec, width, height, true);
  const time = isTime ? prepareTimeChart(spec, width, height, true) : null;
  const plot = time?.plot ?? category.plot;
  const yDomain = time?.yDomain ?? category.yDomain;
  const yTicks = time?.yTicks ?? category.yTicks;
  const xLabels = time?.xLabels ?? category.xLabels;
  const xPositions = time?.xPositions ?? category.xPositions;
  const yScale = linearScale(yDomain, [plot.bottom, plot.top]);
  const baseline = yScale.value(0);

  return (
    <ChartFrame
      width={width}
      height={height}
      spec={spec}
      yDomain={yDomain}
      yTicks={yTicks}
      xLabels={xLabels}
      xPositions={xPositions}
      language={language}
    >
      {() => (
        <G>
          {spec.series.map((series, seriesIndex) => {
            const color = chartSeriesColor(series.tone, seriesIndex, colors);
            const points: [number, number][] = [];
            if (time) {
              for (const point of series.points) {
                if (typeof point.x !== 'number' || point.y == null) continue;
                points.push([
                  time.xScale.value(point.x),
                  yScale.value(point.y),
                ]);
              }
            } else {
              const values =
                category.values.find((row) => row.series.key === series.key)
                  ?.values ?? [];
              values.forEach((value, index) => {
                if (value == null) return;
                points.push([
                  category.band.center(index),
                  yScale.value(value),
                ]);
              });
            }
            if (points.length < 2) return null;
            const line = buildLinePath(points);
            const area = `${line} L ${points[points.length - 1][0]} ${baseline} L ${points[0][0]} ${baseline} Z`;
            return (
              <G key={series.key}>
                <Path d={area} fill={color} opacity={0.16} />
                <Path
                  d={line}
                  fill='none'
                  stroke={color}
                  strokeWidth={2.2}
                  strokeLinecap='round'
                />
              </G>
            );
          })}
        </G>
      )}
    </ChartFrame>
  );
};
