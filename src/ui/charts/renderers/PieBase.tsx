import React from 'react';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

import { totalForPie } from '@/src/domain/charts/validation';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { formatChartValue } from '../format';
import { chartToneColor, fallbackChartTone } from '../theme';
import type { ChartRendererProps } from '../types';

const TAU = Math.PI * 2;

const polar = (cx: number, cy: number, radius: number, angle: number) => ({
  x: cx + radius * Math.cos(angle),
  y: cy + radius * Math.sin(angle),
});

const arc = (
  cx: number,
  cy: number,
  radius: number,
  start: number,
  end: number
) => {
  const p1 = polar(cx, cy, radius, start);
  const p2 = polar(cx, cy, radius, end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${large} 1 ${p2.x} ${p2.y}`;
};

const slicePath = (
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number
) => {
  const full = end - start >= TAU - 0.0001;
  if (full) {
    const mid = start + Math.PI;
    if (inner <= 0) {
      return `${arc(cx, cy, outer, start, mid)} ${arc(cx, cy, outer, mid, start + TAU)} Z`;
    }
    const outerStart = polar(cx, cy, outer, start);
    const outerMid = polar(cx, cy, outer, mid);
    const innerStart = polar(cx, cy, inner, start);
    const innerMid = polar(cx, cy, inner, mid);
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outer} ${outer} 0 1 1 ${outerMid.x} ${outerMid.y}`,
      `A ${outer} ${outer} 0 1 1 ${outerStart.x} ${outerStart.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${inner} ${inner} 0 1 0 ${innerMid.x} ${innerMid.y}`,
      `A ${inner} ${inner} 0 1 0 ${innerStart.x} ${innerStart.y}`,
      'Z',
    ].join(' ');
  }
  if (inner <= 0) {
    const p1 = polar(cx, cy, outer, start);
    const p2 = polar(cx, cy, outer, end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${outer} ${outer} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
  }
  const outerStart = polar(cx, cy, outer, start);
  const outerEnd = polar(cx, cy, outer, end);
  const innerStart = polar(cx, cy, inner, start);
  const innerEnd = polar(cx, cy, inner, end);
  const large = end - start > Math.PI ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
};

type PieBaseProps = ChartRendererProps & {
  donut: boolean;
};

const PieBase = ({
  spec,
  width,
  height,
  onPointPress,
  activeKey,
  donut,
}: PieBaseProps) => {
  const { colors } = useTheme();
  const series = spec.series[0];
  const points = series?.points.filter((point) => (point.y ?? 0) > 0) ?? [];
  const total = totalForPie({ ...spec, series: series ? [series] : [] });
  if (!series || points.length === 0 || total <= 0) return null;

  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.max(20, Math.min(width, height) / 2 - 12);
  const inner = donut ? outer * 0.58 : 0;
  const format = spec.yAxis?.format ?? 'number';
  const unit = spec.yAxis?.unit;
  let angle = -Math.PI / 2;

  return (
    <Svg width={width} height={height}>
      <G>
        {points.map((point, index) => {
          const value = Math.max(0, point.y ?? 0);
          const sweep = (value / total) * TAU;
          const start = angle;
          const end = angle + sweep;
          angle = end;
          const text =
            point.tone != null
              ? chartToneColor(point.tone, colors)
              : fallbackChartTone(index, colors);
          const key = `${series.key}:${String(point.x)}`;
          const mid = start + sweep / 2;
          const labelPoint = polar(
            cx,
            cy,
            inner > 0 ? (outer + inner) / 2 : outer * 0.68,
            mid
          );
          return (
            <G key={key}>
              <Path
                d={slicePath(cx, cy, outer, inner, start, end)}
                fill={text}
                opacity={activeKey === key ? 1 : 0.88}
                stroke={colors.surface}
                strokeWidth={2}
                onPress={() =>
                  onPointPress({
                    key,
                    seriesKey: series.key,
                    seriesLabel: series.label,
                    label: String(point.x),
                    value,
                    x: labelPoint.x,
                    y: labelPoint.y,
                    color: text,
                  })
                }
              />
              {spec.showValues && sweep > 0.25 ? (
                <SvgText
                  x={labelPoint.x}
                  y={labelPoint.y + 3}
                  fill={colors.onPrimary}
                  fontSize={10}
                  fontWeight='600'
                  textAnchor='middle'
                >
                  {`${Math.round((value / total) * 100)}%`}
                </SvgText>
              ) : null}
            </G>
          );
        })}
        {donut ? (
          <SvgText
            x={cx}
            y={cy + 4}
            fill={colors.text}
            fontSize={14}
            fontWeight='700'
            textAnchor='middle'
          >
            {formatChartValue(total, format, unit, true)}
          </SvgText>
        ) : null}
      </G>
    </Svg>
  );
};

export const PieRenderer = (props: ChartRendererProps) => (
  <PieBase {...props} donut={false} />
);

export const DonutRenderer = (props: ChartRendererProps) => (
  <PieBase {...props} donut />
);
