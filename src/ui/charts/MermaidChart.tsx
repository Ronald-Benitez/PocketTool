import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { WebView } from 'react-native-webview';

import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

let cachedBundle: string | null = null;
const EMPTY_PALETTE: string[] = [];
const EMPTY_LEGEND: MermaidChartLegendItem[] = [];

const estimateMinWidth = (definition: string) => {
  const xAxis = definition.match(/x-axis\s*\[(.*)\]/);
  if (!xAxis) return null;
  const labels = xAxis[1].match(/"[^"]*"/g)?.length ?? 0;
  if (labels === 0) return null;
  return Math.max(320, labels * 72);
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
  minWidth: number | null
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
  html, body { margin: 0; padding: 0; width: 100%; max-width: 100%; overflow-x: auto; background: transparent; color: ${colors.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  #chart { box-sizing: border-box; width: 100%; ${minWidth ? `min-width: ${minWidth}px;` : 'max-width: 100%;'} padding: 0 8px; overflow: visible; display: flex; align-items: center; justify-content: ${minWidth ? 'flex-start' : 'center'}; min-height: 120px; }
  #chart svg { display: block; width: 100% !important; max-width: none !important; height: auto !important; }
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

  const minWidth = useMemo(
    () => (definition ? estimateMinWidth(definition) : null),
    [definition]
  );

  const html = useMemo(() => {
    if (!bundle || !definition) return null;
    return buildHtml(
      bundle,
      definition,
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
      minWidth
    );
  }, [
    bundle,
    definition,
    palette,
    minWidth,
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
            key={`${colors.background}-${definition}`}
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
      {showData ? fallback : null}
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
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
