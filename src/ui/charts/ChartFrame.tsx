import React from 'react';
import Svg, { G, Line, Text as SvgText } from 'react-native-svg';

import type { ChartSpec } from '@/src/domain/charts/types';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { ellipsize, formatChartValue, formatChartXValue } from './format';

export type ChartPlot = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export const CHART_PADDING = { top: 14, right: 14, bottom: 34, left: 48 };

export const chartPlot = (width: number, height: number): ChartPlot => ({
  left: CHART_PADDING.left,
  top: CHART_PADDING.top,
  right: width - CHART_PADDING.right,
  bottom: height - CHART_PADDING.bottom,
  width: Math.max(1, width - CHART_PADDING.left - CHART_PADDING.right),
  height: Math.max(1, height - CHART_PADDING.top - CHART_PADDING.bottom),
});

type ChartFrameProps = {
  width: number;
  height: number;
  spec: ChartSpec;
  yDomain: [number, number];
  yTicks: number[];
  xLabels: (string | number)[];
  xPositions: number[];
  language: string;
  children: (plot: ChartPlot) => React.ReactNode;
};

export const ChartFrame = ({
  width,
  height,
  spec,
  yDomain,
  yTicks,
  xLabels,
  xPositions,
  language,
  children,
}: ChartFrameProps) => {
  const { colors } = useTheme();
  const plot = chartPlot(width, height);
  const format = spec.yAxis?.format ?? 'number';
  const unit = spec.yAxis?.unit;
  const rotateLabels =
    xLabels.length > 6 && plot.width / Math.max(1, xLabels.length) < 58;
  const spanMs =
    typeof xLabels[0] === 'number' && typeof xLabels[xLabels.length - 1] === 'number'
      ? Math.abs(Number(xLabels[xLabels.length - 1]) - Number(xLabels[0]))
      : 0;

  return (
    <Svg width={width} height={height}>
      {yTicks.map((tick) => {
        const raw = yDomain[1] === yDomain[0] ? 0 : (tick - yDomain[0]) / (yDomain[1] - yDomain[0]);
        const y = plot.bottom - raw * plot.height;
        return (
          <G key={`tick-${tick}`}>
            <Line
              x1={plot.left}
              x2={plot.right}
              y1={y}
              y2={y}
              stroke={colors.border}
              strokeWidth={1}
              opacity={0.45}
            />
            <SvgText
              x={plot.left - 7}
              y={y + 4}
              fill={colors.textMuted}
              fontSize={10}
              textAnchor='end'
            >
              {formatChartValue(tick, format, unit, true)}
            </SvgText>
          </G>
        );
      })}
      <Line
        x1={plot.left}
        x2={plot.right}
        y1={plot.bottom}
        y2={plot.bottom}
        stroke={colors.border}
        strokeWidth={1}
      />
      {xLabels.map((label, index) => {
        const x = xPositions[index];
        if (x == null) return null;
        const text = formatChartXValue(
          label,
          spec.xAxis,
          language,
          spanMs
        );
        return (
          <SvgText
            key={`x-${index}`}
            x={x}
            y={plot.bottom + 14}
            fill={colors.textMuted}
            fontSize={9}
            textAnchor={rotateLabels ? 'end' : 'middle'}
            rotation={rotateLabels ? -35 : 0}
            originX={x}
            originY={plot.bottom + 14}
          >
            {ellipsize(text, rotateLabels ? 12 : 10)}
          </SvgText>
        );
      })}
      {children(plot)}
    </Svg>
  );
};
