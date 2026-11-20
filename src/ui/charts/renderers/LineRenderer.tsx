import React from 'react';
import { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { linearScale } from '@/src/domain/charts/scale';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { ChartFrame } from '../ChartFrame';
import { formatChartValue } from '../format';
import { chartSeriesColor } from '../theme';
import type { ChartRendererProps } from '../types';
import {
  buildLinePath,
  prepareCategoryChart,
  prepareTimeChart,
} from './shared';

export const LineRenderer = ({
  spec,
  width,
  height,
  language,
  onPointPress,
  activeKey,
}: ChartRendererProps) => {
  const { colors } = useTheme();
  const isTime = spec.xAxis?.type === 'time';
  const category = prepareCategoryChart(spec, width, height, false);
  const time = isTime ? prepareTimeChart(spec, width, height, false) : null;
  const plot = time?.plot ?? category.plot;
  const yDomain = time?.yDomain ?? category.yDomain;
  const yTicks = time?.yTicks ?? category.yTicks;
  const xLabels = time?.xLabels ?? category.xLabels;
  const xPositions = time?.xPositions ?? category.xPositions;
  const yScale = linearScale(yDomain, [plot.bottom, plot.top]);
  const format = spec.yAxis?.format ?? 'number';
  const unit = spec.yAxis?.unit;
  const activeXValue =
    activeKey != null ? activeKey.split(':').slice(1).join(':') : null;
  const activeX = (() => {
    if (activeXValue == null) return null;
    if (time) {
      const numeric = Number(activeXValue);
      return Number.isFinite(numeric) ? time.xScale.value(numeric) : null;
    }
    const index = category.categories.indexOf(activeXValue);
    return index >= 0 ? category.band.center(index) : null;
  })();

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
      {(framePlot) => (
        <G>
          {spec.series.map((series, seriesIndex) => {
            const color = chartSeriesColor(series.tone, seriesIndex, colors);
            const points: [number, number, string, string | number][] = [];
            if (time) {
              for (const point of series.points) {
                if (typeof point.x !== 'number' || point.y == null) {
                  points.push([NaN, NaN, '', '']);
                  continue;
                }
                points.push([
                  time.xScale.value(point.x),
                  yScale.value(point.y),
                  `${series.key}:${point.x}`,
                  point.x,
                ]);
              }
            } else {
              const values =
                category.values.find((row) => row.series.key === series.key)
                  ?.values ?? [];
              values.forEach((value, index) => {
                if (value == null) {
                  points.push([NaN, NaN, '', '']);
                  return;
                }
                points.push([
                  category.band.center(index),
                  yScale.value(value),
                  `${series.key}:${category.categories[index]}`,
                  category.categories[index],
                ]);
              });
            }

            const segments: [number, number][][] = [];
            let current: [number, number][] = [];
            for (const [x, y] of points) {
              if (!Number.isFinite(x) || !Number.isFinite(y)) {
                if (current.length > 0) segments.push(current);
                current = [];
                continue;
              }
              current.push([x, y]);
            }
            if (current.length > 0) segments.push(current);

            return (
              <G key={series.key}>
                {segments.map((segment, index) => (
                  <Path
                    key={`segment-${index}`}
                    d={buildLinePath(segment)}
                    stroke={color}
                    strokeWidth={2.2}
                    fill='none'
                    strokeLinejoin='round'
                    strokeLinecap='round'
                  />
                ))}
                {points.map(([x, y, key, xValue]) =>
                  Number.isFinite(x) && Number.isFinite(y) ? (
                    <G key={key}>
                      <Circle
                        cx={x}
                        cy={y}
                        r={points.length <= 40 ? 16 : 10}
                        fill='transparent'
                        onPress={() => {
                          const entries = spec.series.flatMap(
                            (candidate, candidateIndex) => {
                              const point = candidate.points.find(
                                (item) =>
                                  String(item.x) === String(xValue) &&
                                  item.y != null
                              );
                              if (!point || point.y == null) return [];
                              return [
                                {
                                  seriesKey: candidate.key,
                                  seriesLabel: candidate.label,
                                  value: point.y,
                                  color: chartSeriesColor(
                                    candidate.tone,
                                    candidateIndex,
                                    colors
                                  ),
                                  secondaryValue: point.tooltipValue ?? null,
                                  secondaryFormat: point.tooltipFormat,
                                  secondaryUnit: point.tooltipUnit,
                                },
                              ];
                            }
                          );
                          onPointPress({
                            key,
                            seriesKey: series.key,
                            seriesLabel: series.label,
                            label: String(xValue),
                            value:
                              series.points.find(
                                (point) =>
                                  `${series.key}:${String(point.x)}` === key
                              )?.y ?? 0,
                            x,
                            y,
                            color,
                            entries,
                          });
                        }}
                      />
                      {points.length <= 40 ? (
                        <Circle
                          cx={x}
                          cy={y}
                          r={
                            activeXValue != null &&
                            String(xValue) === activeXValue
                              ? 4.5
                              : 3
                          }
                          fill={
                            activeXValue != null &&
                            String(xValue) === activeXValue
                              ? colors.surface
                              : color
                          }
                          stroke={color}
                          strokeWidth={2}
                          pointerEvents='none'
                        />
                      ) : null}
                    </G>
                  ) : null
                )}
                {spec.showValues && points.length <= 12
                  ? points.map(([x, y, key]) =>
                      Number.isFinite(x) && Number.isFinite(y) ? (
                        <SvgText
                          key={`value-${key}`}
                          x={x}
                          y={y - 8}
                          fill={colors.textMuted}
                          fontSize={9}
                          textAnchor='middle'
                        >
                          {formatChartValue(
                            series.points.find(
                              (point) =>
                                `${series.key}:${String(point.x)}` === key
                            )?.y ?? 0,
                            format,
                            unit,
                            true
                          )}
                        </SvgText>
                      ) : null
                    )
                  : null}
              </G>
            );
          })}
          {activeX != null ? (
            <Line
              x1={activeX}
              x2={activeX}
              y1={plot.top}
              y2={plot.bottom}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray='4 4'
            />
          ) : null}
        </G>
      )}
    </ChartFrame>
  );
};
