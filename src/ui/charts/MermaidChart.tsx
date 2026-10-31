import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { WebView } from 'react-native-webview';

import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

let cachedBundle: string | null = null;
const EMPTY_PALETTE: string[] = [];
const EMPTY_LEGEND: MermaidChartLegendItem[] = [];

const estimateChartWidth = (definition: string) => {
  if (!definition.startsWith('xychart')) return null;
  const xAxis = definition.match(/x-axis\s*\[(.*)\]/);
  const labels = xAxis?.[1].match(/"[^"]*"/g)?.length ?? 0;
  return Math.max(360, labels * 64);
};

type ChartDataItem = {
  key: string;
  label: string;
};

const parseChartData = (definition: string): ChartDataItem[] => {
  if (definition.startsWith('pie')) {
    return definition.split('\n').flatMap((line, index) => {
      const match = line.match(/^\s*"([^"]*)"\s*:\s*(.+)$/);
      return match ? [{ key: `pie-${index}`, label: match[1] }] : [];
    });
  }

  if (definition.startsWith('xychart')) {
    const xAxis = definition.match(/x-axis\s*\[(.*)\]/);
    return (xAxis?.[1].match(/"[^"]*"/g) ?? []).map((label, index) => ({
      key: `x-${index}`,
      label: label.slice(1, -1),
    }));
  }

  return [];
};

const filterChartData = (
  definition: string,
  disabled: Set<string>
): string | null => {
  if (disabled.size === 0) return definition;

  if (definition.startsWith('pie')) {
    const lines = definition.split('\n');
    let dataCount = 0;
    let keptCount = 0;
    const kept = lines.filter((line, index) => {
      const match = line.match(/^\s*"([^"]*)"\s*:\s*(.+)$/);
      if (!match) return true;
      dataCount += 1;
      if (disabled.has(`pie-${index}`)) return false;
      keptCount += 1;
      return true;
    });
    if (dataCount > 0 && keptCount === 0) return null;
    return kept.join('\n');
  }

  if (definition.startsWith('xychart')) {
    const lines = definition.split('\n');
    const xAxisIndex = lines.findIndex((line) => /x-axis\s*\[/.test(line));
    if (xAxisIndex < 0) return definition;
    const labels = lines[xAxisIndex].match(/"[^"]*"/g) ?? [];
    const indices = labels.flatMap((label, index) =>
      disabled.has(`x-${index}`) ? [] : [index]
    );
    if (indices.length === 0) return null;

    lines[xAxisIndex] = `  x-axis [${indices
      .map((index) => labels[index])
      .join(', ')}]`;

    for (let index = 0; index < lines.length; index += 1) {
      const match = lines[index].match(/^(\s*(?:bar|line)\s*)\[(.*)\]\s*$/);
      if (!match) continue;
      const values = match[2].split(',').map((value) => value.trim());
      lines[index] = `${match[1]}[${indices
        .map((valueIndex) => values[valueIndex] ?? '0')
        .join(', ')}]`;
    }

    return lines.join('\n');
  }

  return definition;
};

const loadMermaidBundle = async () => {
  if (cachedBundle) return cachedBundle;
  const asset = Asset.fromModule(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../../../assets/vendor/mermaid/mermaid.min.js.txt')
  );
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) throw new Error('Mermaid asset is not available');
  cachedBundle = await FileSystem.readAsStringAsync(uri);
  return cachedBundle;
};

const buildHtml = (
  bundle: string,
  definition: string,
  colors: {
    background: string;
    text: string;
    textMuted: string;
    primary: string;
    border: string;
    expense: string;
    income: string;
  },
  palette: string[],
  chartWidth: number | null,
  chartHeight: number
) => {
  const safeBundle = bundle.replace(/<\/script/gi, '<\\/script');
  const pieVariables = palette
    .map((color, index) => `pie${index + 1}: '${color}'`)
    .join(', ');
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  html, body { margin: 0; padding: 0; width: 100%; max-width: 100%; overflow-x: auto; overflow-y: hidden; background: transparent; color: ${colors.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  #chart { box-sizing: border-box; ${chartWidth ? `width: ${chartWidth}px; min-width: 100%; height: ${chartHeight}px;` : 'width: 100%; max-width: 100%;'} padding: 0 8px; overflow: visible; display: flex; align-items: center; justify-content: ${chartWidth ? 'flex-start' : 'center'}; min-height: 120px; }
  #chart svg { display: block; width: 100% !important; max-width: none !important; height: ${chartWidth ? '100%' : 'auto'} !important; }
  .error { color: ${colors.expense}; font-size: 13px; padding: 12px; }
</style>
</head>
<body>
<div id="chart"></div>
<script>${safeBundle}</script>
<script>
  (function () {
    const definition = ${JSON.stringify(definition)};
    const finish = (payload) => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    };
    try {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        ${chartWidth ? `xyChart: { width: ${chartWidth}, height: ${chartHeight} },` : ''}
        themeVariables: {
          background: '${colors.background}',
          primaryTextColor: '${colors.text}',
          secondaryTextColor: '${colors.textMuted}',
          tertiaryTextColor: '${colors.textMuted}',
          lineColor: '${colors.border}',
          primaryColor: '${colors.primary}',
          secondaryColor: '${colors.income}',
          tertiaryColor: '${colors.expense}',
          fontSize: '14px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          xyChart: {
            backgroundColor: '${colors.background}',
            titleColor: '${colors.text}',
            dataLabelColor: '${colors.text}',
            legendTextColor: '${colors.text}',
            xAxisTitleColor: '${colors.text}',
            xAxisLabelColor: '${colors.textMuted}',
            xAxisTickColor: '${colors.border}',
            xAxisLineColor: '${colors.border}',
            yAxisTitleColor: '${colors.text}',
            yAxisLabelColor: '${colors.textMuted}',
            yAxisTickColor: '${colors.border}',
            yAxisLineColor: '${colors.border}',
            plotColorPalette: '${palette.join(',')}'
          }${pieVariables ? `,\n          ${pieVariables}` : ''}
        }
      });
      mermaid.render('budget-diagram', definition).then(function (result) {
        document.getElementById('chart').innerHTML = result.svg;
        finish({ type: 'ready' });
      }).catch(function (error) {
        document.getElementById('chart').innerHTML = '<div class="error">' +
          String(error && error.message ? error.message : error) + '</div>';
        finish({ type: 'error', message: String(error && error.message ? error.message : error) });
      });
    } catch (error) {
      document.getElementById('chart').innerHTML = '<div class="error">' +
        String(error && error.message ? error.message : error) + '</div>';
      finish({ type: 'error', message: String(error && error.message ? error.message : error) });
    }
  })();
</script>
</body>
</html>`;
};

export type MermaidChartLegendItem = {
  label: string;
  color: string;
};

export type MermaidChartProps = {
  definition: string | null;
  height?: number;
  accessibilityLabel: string;
  fallback: React.ReactNode;
  palette?: string[];
  legend?: MermaidChartLegendItem[];
};

export const MermaidChart = ({
  definition,
  height = 260,
  accessibilityLabel,
  fallback,
  palette = EMPTY_PALETTE,
  legend = EMPTY_LEGEND,
}: MermaidChartProps) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [bundle, setBundle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showData, setShowData] = useState(false);
  const [disabledData, setDisabledData] = useState<Set<string>>(
    () => new Set()
  );

  const dataItems = useMemo(
    () => (definition ? parseChartData(definition) : []),
    [definition]
  );
  const displayDefinition = useMemo(
    () => (definition ? filterChartData(definition, disabledData) : null),
    [definition, disabledData]
  );

  useEffect(() => {
    setDisabledData(new Set());
  }, [definition]);

  useEffect(() => {
    let mounted = true;
    loadMermaidBundle()
      .then((value) => {
        if (mounted) setBundle(value);
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const chartWidth = useMemo(
    () => (displayDefinition ? estimateChartWidth(displayDefinition) : null),
    [displayDefinition]
  );
  const chartHeight = Math.max(180, height - 16);

  const html = useMemo(() => {
    if (!bundle || !displayDefinition) return null;
    return buildHtml(
      bundle,
      displayDefinition,
      {
        background: colors.surface,
        text: colors.text,
        textMuted: colors.textMuted,
        primary: colors.primary,
        border: colors.border,
        expense: colors.expense,
        income: colors.income,
      },
      palette,
      chartWidth,
      chartHeight
    );
  }, [
    bundle,
    displayDefinition,
    palette,
    chartWidth,
    chartHeight,
    colors.border,
    colors.expense,
    colors.income,
    colors.primary,
    colors.surface,
    colors.text,
    colors.textMuted,
  ]);

  if (!definition) {
    return <>{fallback}</>;
  }

  return (
    <Stack gap='sm'>
      <View
        accessible
        accessibilityRole='image'
        accessibilityLabel={accessibilityLabel}
        style={[styles.container, { backgroundColor: colors.surface }]}
      >
        {error ? (
          <InlineMessage
            variant='warning'
            title={t('budget.chart.error')}
            message={error}
          />
        ) : html ? (
          <WebView
            key={`${colors.background}-${displayDefinition}`}
            source={{ html, baseUrl: 'about:blank' }}
            style={[styles.webview, { height }]}
            containerStyle={styles.webviewContainer}
            originWhitelist={['about:blank']}
            javaScriptEnabled
            domStorageEnabled={false}
            scrollEnabled
            bounces={false}
            mixedContentMode='never'
            onShouldStartLoadWithRequest={(request) =>
              request.url.startsWith('about:blank')
            }
            onError={() => setError(t('budget.chart.error'))}
            onMessage={(event) => {
              try {
                const payload = JSON.parse(event.nativeEvent.data) as {
                  type?: string;
                  message?: string;
                };
                if (payload.type === 'error') {
                  setError(payload.message ?? t('budget.chart.error'));
                }
              } catch {
                // Ignore non-JSON messages from the chart.
              }
            }}
          />
        ) : !displayDefinition ? (
          <View style={styles.fallback}>{fallback}</View>
        ) : (
          <Stack gap='xs' style={styles.loading}>
            <AppText color='muted'>{t('budget.chart.title')}</AppText>
          </Stack>
        )}
      </View>
      {legend.length > 0 ? (
        <Row gap='md' wrap>
          {legend.map((item) => (
            <Row key={item.label} gap='xs' align='center'>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: item.color },
                ]}
              />
              <AppText variant='caption' color='muted'>
                {item.label}
              </AppText>
            </Row>
          ))}
        </Row>
      ) : null}
      <Button
        label={
          showData ? t('budget.chart.hideData') : t('budget.chart.viewData')
        }
        variant='ghost'
        size='sm'
        onPress={() => setShowData((value) => !value)}
      />
      {showData ? (
        dataItems.length > 0 ? (
          <Stack gap='sm'>
            <Row justify='space-between' align='center' gap='sm'>
              <AppText variant='caption' color='muted' style={{ flex: 1 }}>
                {t('budget.chart.dataHint')}
              </AppText>
              <Button
                label={t('budget.chart.showAll')}
                variant='ghost'
                size='sm'
                onPress={() => setDisabledData(new Set())}
              />
            </Row>
            <Stack gap='xs'>
              {dataItems.map((item) => (
                <SwitchField
                  key={item.key}
                  label={item.label}
                  value={!disabledData.has(item.key)}
                  onChange={(enabled) => {
                    setDisabledData((current) => {
                      const next = new Set(current);
                      if (enabled) next.delete(item.key);
                      else next.add(item.key);
                      return next;
                    });
                  }}
                />
              ))}
            </Stack>
          </Stack>
        ) : (
          fallback
        )
      ) : null}
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 120,
  },
  webview: {
    backgroundColor: 'transparent',
  },
  webviewContainer: {
    backgroundColor: 'transparent',
  },
  loading: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fallback: {
    minHeight: 120,
    justifyContent: 'center',
    padding: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
