import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { ChartSpec } from '@/src/domain/charts/types';
import { categoryLabels } from '@/src/domain/charts/scale';
import { specHasData, totalForPie } from '@/src/domain/charts/validation';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { TextField } from '@/src/ui/forms/TextField';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { useChartPreferences } from './ChartPreferencesProvider';
import { ChartLegend, legendSeriesForSpec } from './legend';
import { getChartRenderer } from './registry';
import { formatChartTooltipValue, formatChartValue, formatChartXValue } from './format';
import type { ChartActivePoint } from './types';

export type ChartProps = {
  spec: ChartSpec | null;
  height?: number;
  empty?: React.ReactNode;
  accessibilityLabel: string;
  chartKey?: string;
  showDataToggle?: boolean;
  zoomable?: boolean;
  showLegend?: boolean;
};

type ChartErrorBoundaryState = { hasError: boolean };

class ChartErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  ChartErrorBoundaryState
> {
  state: ChartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) console.warn('[charts] render failed', error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const filterSpec = (
  spec: ChartSpec,
  hiddenSeries: string[],
  dataLimit: number | null,
  limitFromEnd: boolean
): ChartSpec => {
  const hidden = new Set(hiddenSeries);
  if (spec.kind === 'pie' || spec.kind === 'donut') {
    return {
      ...spec,
      series: spec.series.map((series) => {
        const points = series.points.filter(
          (point) => !hidden.has(String(point.x))
        );
        const limited =
          dataLimit && dataLimit > 0
            ? limitFromEnd
              ? points.slice(-dataLimit)
              : points.slice(0, dataLimit)
            : points;
        return { ...series, points: limited };
      }),
    };
  }
  const visibleSeries = spec.series.filter((series) => !hidden.has(series.key));
  if (!dataLimit || dataLimit <= 0) {
    return { ...spec, series: visibleSeries };
  }

  const categories = categoryLabels({ ...spec, series: visibleSeries });
  const sortedCategories =
    spec.xAxis?.type === 'time'
      ? [...categories].sort((left, right) => Number(left) - Number(right))
      : categories;
  const kept = limitFromEnd
    ? sortedCategories.slice(-dataLimit)
    : sortedCategories.slice(0, dataLimit);
  const keptSet = new Set(kept);
  return {
    ...spec,
    series: visibleSeries.map((series) => ({
      ...series,
      points: series.points.filter((point) => keptSet.has(String(point.x))),
    })),
  };
};

const chartSummary = (spec: ChartSpec) =>
  spec.series
    .map((series) => {
      const values = series.points
        .map((point) => point.y)
        .filter((value): value is number => value != null);
      return `${series.label}: ${values.length}`;
    })
    .join(' · ');

export const Chart = ({
  spec,
  height = 260,
  empty,
  accessibilityLabel,
  chartKey,
  showDataToggle = true,
  zoomable = true,
  showLegend = true,
}: ChartProps) => {
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const preferences = useChartPreferences();
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [active, setActive] = useState<ChartActivePoint | null>(null);
  const [showData, setShowData] = useState(false);
  const [localHidden, setLocalHidden] = useState<string[]>([]);
  const [localLimit, setLocalLimit] = useState<number | null>(null);
  const [localLimitFromEnd, setLocalLimitFromEnd] = useState(true);
  const [localZoom, setLocalZoom] = useState(1);

  const stored = chartKey
    ? preferences.get(chartKey, { zoom: 1, limitFromEnd: true })
    : null;
  const storedHidden = stored?.hiddenSeries;
  const hiddenSeries = useMemo(
    () => (chartKey ? storedHidden ?? [] : localHidden),
    [chartKey, localHidden, storedHidden]
  );
  const dataLimit = chartKey ? stored?.dataLimit ?? null : localLimit;
  const limitFromEnd = chartKey
    ? stored?.limitFromEnd ?? true
    : localLimitFromEnd;
  const zoom = chartKey ? stored?.zoom ?? 1 : localZoom;

  useEffect(() => {
    setActive(null);
  }, [spec]);

  const filtered = useMemo(
    () => (spec ? filterSpec(spec, hiddenSeries, dataLimit, limitFromEnd) : null),
    [spec, hiddenSeries, dataLimit, limitFromEnd]
  );

  const hasData = Boolean(
    filtered &&
      specHasData(filtered) &&
      (!['pie', 'donut'].includes(filtered.kind) ||
        totalForPie(filtered) > 0)
  );
  const rendererSpec = filtered && hasData ? filtered : null;
  const Renderer = rendererSpec ? getChartRenderer(rendererSpec.kind) : null;
  const chartWidth = Math.max(layoutWidth, Math.round(layoutWidth * zoom));
  const format = spec?.yAxis?.format ?? 'number';
  const unit = spec?.yAxis?.unit;
  const tooltipWidth = 196;
  const tooltipEntries = active?.entries?.length ? active.entries : null;
  const tooltipHasSecondary = Boolean(
    tooltipEntries?.some(
      (entry) =>
        entry.secondaryValue != null && entry.secondaryValue !== entry.value
    )
  );
  const tooltipHeight =
    24 + (tooltipEntries?.length ?? 1) * (tooltipHasSecondary ? 36 : 18);

  const setHidden = (next: string[]) => {
    if (chartKey) preferences.setHiddenSeries(chartKey, next);
    else setLocalHidden(next);
  };
  const setLimit = (value: number | null) => {
    if (chartKey) preferences.setDataLimit(chartKey, value);
    else setLocalLimit(value);
  };
  const setFromEnd = (value: boolean) => {
    if (chartKey) preferences.setLimitFromEnd(chartKey, value);
    else setLocalLimitFromEnd(value);
  };
  const setZoomValue = (value: number) => {
    if (chartKey) preferences.setZoom(chartKey, value);
    else setLocalZoom(value);
  };

  const dataRows = useMemo(() => {
    if (!rendererSpec) return [];
    const categories = categoryLabels(rendererSpec);
    const ordered =
      rendererSpec.xAxis?.type === 'time'
        ? [...categories].sort((left, right) => Number(left) - Number(right))
        : categories;
    return ordered.map((category) => ({
      category,
      values: rendererSpec.series.map((series) => ({
        key: series.key,
        label: series.label,
        value:
          series.points.find((point) => String(point.x) === category)?.y ??
          null,
        secondaryValue:
          series.points.find((point) => String(point.x) === category)
            ?.tooltipValue ?? null,
        secondaryFormat: series.points.find(
          (point) => String(point.x) === category
        )?.tooltipFormat,
        secondaryUnit: series.points.find(
          (point) => String(point.x) === category
        )?.tooltipUnit,
      })),
    }));
  }, [rendererSpec]);

  const toggleItems = useMemo(() => {
    if (!spec) return [];
    if (spec.kind === 'pie' || spec.kind === 'donut') {
      return (spec.series[0]?.points ?? []).map((point) => ({
        key: String(point.x),
        label: String(point.x),
      }));
    }
    return spec.series.map((series) => ({
      key: series.key,
      label: series.label,
    }));
  }, [spec]);

  if (!spec || !hasData) {
    return (
      <View style={[styles.empty, { minHeight: Math.min(160, height) }]}>
        {empty ?? <AppText color='muted'>{t('charts.noData')}</AppText>}
      </View>
    );
  }

  const content = (
    <View style={{ width: chartWidth, height }}>
      {Renderer && rendererSpec ? (
        <ChartErrorBoundary
          fallback={
            <InlineMessage variant='warning' message={t('charts.error')} />
          }
        >
          <Renderer
            spec={rendererSpec}
            width={chartWidth}
            height={height}
            language={language}
            activeKey={active?.key ?? null}
            onPointPress={(point) =>
              setActive((current) =>
                current?.key === point.key ? null : point
              )
            }
          />
        </ChartErrorBoundary>
      ) : null}
      {active ? (
        <View
          pointerEvents='none'
          style={[
            styles.tooltip,
            {
              width: tooltipWidth,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              left: Math.max(
                4,
                Math.min(
                  active.x - tooltipWidth / 2,
                  Math.max(4, chartWidth - tooltipWidth - 4)
                )
              ),
              top: Math.max(
                4,
                Math.min(
                  active.y - tooltipHeight,
                  Math.max(4, height - tooltipHeight - 4)
                )
              ),
            },
          ]}
        >
          <AppText variant='caption' weight='600'>
            {formatChartXValue(
              Number.isNaN(Number(active.label))
                ? active.label
                : Number(active.label),
              spec.xAxis,
              language
            )}
          </AppText>
          {tooltipEntries ? (
            tooltipEntries.map((entry) => (
              <Row
                key={entry.seriesKey}
                justify='space-between'
                align='center'
                gap='xs'
              >
                <Row gap='xxs' align='center' style={{ flex: 1 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      backgroundColor: entry.color,
                    }}
                  />
                  <AppText
                    variant='caption'
                    color='muted'
                    numberOfLines={1}
                    style={{ flex: 1 }}
                  >
                    {entry.seriesLabel}
                  </AppText>
                </Row>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant='caption'>
                    {formatChartTooltipValue(
                      entry.value,
                      entry.secondaryValue != null &&
                        entry.secondaryValue === entry.value &&
                        entry.secondaryFormat
                        ? entry.secondaryFormat
                        : format,
                      entry.secondaryValue != null &&
                        entry.secondaryValue === entry.value
                        ? entry.secondaryUnit ?? unit
                        : unit
                    )}
                  </AppText>
                  {entry.secondaryValue != null &&
                  entry.secondaryValue !== entry.value ? (
                    <AppText variant='caption' color='muted'>
                      {formatChartTooltipValue(
                        entry.secondaryValue,
                        entry.secondaryFormat ?? format,
                        entry.secondaryUnit ?? unit
                      )}
                    </AppText>
                  ) : null}
                </View>
              </Row>
            ))
          ) : (
            <>
              <AppText variant='caption' color='muted'>
                {active.seriesLabel}
              </AppText>
              <AppText variant='caption'>
                {formatChartTooltipValue(active.value, format, unit)}
              </AppText>
            </>
          )}
        </View>
      ) : null}
    </View>
  );

  return (
    <Stack gap='sm'>
      <View
        accessible
        accessibilityRole='image'
        accessibilityLabel={`${accessibilityLabel}. ${chartSummary(rendererSpec ?? spec)}`}
        onLayout={(event) => setLayoutWidth(event.nativeEvent.layout.width)}
        style={styles.chartContainer}
      >
        {layoutWidth > 0 ? (
          zoom > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ width: chartWidth }}
            >
              {content}
            </ScrollView>
          ) : (
            <Animated.View entering={FadeIn.duration(180)}>{content}</Animated.View>
          )
        ) : (
          <View style={{ height }} />
        )}
      </View>

      {showLegend ? (
        <ChartLegend series={legendSeriesForSpec(rendererSpec ?? spec)} />
      ) : null}

      {zoomable ? (
        <Row justify='space-between' align='center' gap='sm'>
          <AppText variant='caption' color='muted'>
            {t('charts.zoom')}: {Math.round(zoom * 100)}%
          </AppText>
          <Row gap='xs' align='center'>
            <Button
              label='−'
              variant='outline'
              size='sm'
              disabled={zoom <= 1}
              accessibilityLabel={t('charts.zoomOut')}
              onPress={() =>
                setZoomValue(Math.max(1, Math.round((zoom - 0.25) * 100) / 100))
              }
            />
            <Button
              label='+'
              variant='outline'
              size='sm'
              disabled={zoom >= 2.5}
              accessibilityLabel={t('charts.zoomIn')}
              onPress={() =>
                setZoomValue(Math.min(2.5, Math.round((zoom + 0.25) * 100) / 100))
              }
            />
          </Row>
        </Row>
      ) : null}

      <AppText variant='caption' color='muted'>
        {t('charts.tapHint')}
      </AppText>

      {showDataToggle ? (
        <Button
          label={showData ? t('charts.hideData') : t('charts.showData')}
          variant='ghost'
          size='sm'
          onPress={() => setShowData((value) => !value)}
        />
      ) : null}

      {showData ? (
        <Stack gap='sm'>
          <AppText variant='caption' color='muted'>
            {t('charts.dataHint')}
          </AppText>
          <TextField
            label={t('charts.dataLimit')}
            value={dataLimit != null ? String(dataLimit) : ''}
            onChangeText={(value) => {
              const parsed = Number(value.replace(/[^0-9]/g, ''));
              setLimit(parsed > 0 ? parsed : null);
            }}
            keyboardType='number-pad'
            placeholder={t('charts.allData')}
          />
          <SwitchField
            label={t('charts.limitFromEnd')}
            value={limitFromEnd}
            onChange={setFromEnd}
            onLabel={t('charts.last')}
            offLabel={t('charts.first')}
          />
          <Stack gap='xxs'>
            {toggleItems.map((item) => {
              const enabled = !hiddenSeries.includes(item.key);
              return (
                <Row
                  key={item.key}
                  justify='space-between'
                  align='center'
                  gap='sm'
                  style={{ minHeight: 34 }}
                >
                  <AppText variant='caption' style={{ flex: 1 }} numberOfLines={1}>
                    {item.label}
                  </AppText>
                  <Switch
                    value={enabled}
                    onValueChange={(value) =>
                      setHidden(
                        value
                          ? hiddenSeries.filter((key) => key !== item.key)
                          : [...hiddenSeries, item.key]
                      )
                    }
                    trackColor={{
                      false: colors.switchOff,
                      true: colors.switchOn,
                    }}
                    thumbColor={enabled ? colors.onPrimary : colors.surface}
                    ios_backgroundColor={colors.switchOff}
                    accessibilityLabel={item.label}
                  />
                </Row>
              );
            })}
          </Stack>
          <Button
            label={t('charts.reset')}
            variant='ghost'
            size='sm'
            onPress={() => {
              setHidden([]);
              setLimit(null);
            }}
          />
          <ScrollView style={{ maxHeight: 260 }}>
            <Row justify='space-between' gap='sm' style={styles.tableHeader}>
              <AppText variant='caption' color='muted' style={{ flex: 1 }}>
                {t('charts.category')}
              </AppText>
              {rendererSpec?.series.map((series) => (
                <AppText
                  key={series.key}
                  variant='caption'
                  color='muted'
                  style={{ flex: 1, textAlign: 'right' }}
                  numberOfLines={1}
                >
                  {series.label}
                </AppText>
              ))}
            </Row>
            {dataRows.map((row) => (
              <Row key={row.category} justify='space-between' gap='sm'>
                <AppText variant='caption' style={{ flex: 1 }} numberOfLines={1}>
                  {formatChartXValue(
                    Number.isNaN(Number(row.category))
                      ? row.category
                      : Number(row.category),
                    spec.xAxis,
                    language
                  )}
                </AppText>
                {row.values.map((value) => {
                  const rawPrimary =
                    value.secondaryValue != null &&
                    value.secondaryValue === value.value;
                  const primaryFormat = rawPrimary
                    ? value.secondaryFormat ?? format
                    : format;
                  const primaryUnit = rawPrimary
                    ? value.secondaryUnit ?? unit
                    : unit;
                  return (
                    <View
                      key={value.key}
                      style={{ flex: 1, alignItems: 'flex-end' }}
                    >
                      <AppText variant='caption'>
                        {value.value == null
                          ? '—'
                          : formatChartValue(
                              value.value,
                              primaryFormat,
                              primaryUnit
                            )}
                      </AppText>
                      {value.secondaryValue != null &&
                      value.secondaryValue !== value.value ? (
                        <AppText variant='caption' color='muted'>
                          {formatChartValue(
                            value.secondaryValue,
                            value.secondaryFormat ?? format,
                            value.secondaryUnit ?? unit
                          )}
                        </AppText>
                      ) : null}
                    </View>
                  );
                })}
              </Row>
            ))}
          </ScrollView>
        </Stack>
      ) : null}
    </Stack>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  empty: {
    justifyContent: 'center',
    padding: 16,
  },
  tooltip: {
    position: 'absolute',
    width: 148,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  tableHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 4,
  },
});

export default Chart;
