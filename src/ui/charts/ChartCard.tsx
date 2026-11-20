import React from 'react';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { ChartSpec } from '@/src/domain/charts/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { Chart } from './Chart';
import { useChartPreferences } from './ChartPreferencesProvider';
import { ChartLegend, legendSeriesForSpec } from './legend';

export type ChartCardProps = {
  chartKey: string;
  title?: string;
  subtitle?: string;
  spec: ChartSpec | null;
  height?: number;
  empty?: React.ReactNode;
  defaultCollapsed?: boolean;
  showDataToggle?: boolean;
  zoomable?: boolean;
  actions?: React.ReactNode;
};

export const ChartCard = ({
  chartKey,
  title,
  subtitle,
  spec,
  height = 260,
  empty,
  defaultCollapsed = false,
  showDataToggle = true,
  zoomable = true,
  actions,
}: ChartCardProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const preferences = useChartPreferences();
  const stored = preferences.get(chartKey, { collapsed: defaultCollapsed });
  const collapsed = stored.collapsed;
  const resolvedTitle = title ?? spec?.title ?? t('charts.title');
  const toggleLabel = collapsed
    ? t('charts.expand', { title: resolvedTitle })
    : t('charts.collapse', { title: resolvedTitle });

  return (
    <Surface variant='outlined' padding='md'>
      <Stack gap='sm'>
        <Pressable
          onPress={() => preferences.setCollapsed(chartKey, !collapsed)}
          accessibilityRole='button'
          accessibilityLabel={toggleLabel}
          accessibilityState={{ expanded: !collapsed }}
          style={{ minHeight: 40, justifyContent: 'center' }}
        >
          <Row justify='space-between' align='center' gap='sm'>
            <View style={{ flex: 1 }}>
              <AppText variant='subtitle'>{resolvedTitle}</AppText>
              {subtitle ? (
                <AppText variant='caption' color='muted'>
                  {subtitle}
                </AppText>
              ) : null}
            </View>
            <MaterialIcons
              name={collapsed ? 'expand-more' : 'expand-less'}
              size={24}
              color={colors.textMuted}
            />
          </Row>
        </Pressable>

        {collapsed ? (
          <ChartLegend series={legendSeriesForSpec(spec)} compact />
        ) : (
          <>
            {actions}
            <Chart
              spec={spec}
              height={height}
              empty={empty}
              accessibilityLabel={resolvedTitle}
              chartKey={chartKey}
              showDataToggle={showDataToggle}
              zoomable={zoomable}
            />
          </>
        )}
      </Stack>
    </Surface>
  );
};

export type ChartSectionProps = {
  title?: string;
  chartKeys: string[];
  children: React.ReactNode;
};

export const ChartSection = ({
  title,
  chartKeys,
  children,
}: ChartSectionProps) => {
  const { t } = useLanguage();
  const preferences = useChartPreferences();
  if (chartKeys.length === 0) return <>{children}</>;

  return (
    <Stack gap='sm'>
      {title ? <AppText variant='subtitle'>{title}</AppText> : null}
      {chartKeys.length > 1 ? (
        <Row gap='sm' wrap>
          <Pressable
            onPress={() => preferences.setAllCollapsed(chartKeys, false)}
            accessibilityRole='button'
            accessibilityLabel={t('charts.expandAll')}
          >
            <AppText variant='caption' color='primary'>
              {t('charts.expandAll')}
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => preferences.setAllCollapsed(chartKeys, true)}
            accessibilityRole='button'
            accessibilityLabel={t('charts.collapseAll')}
          >
            <AppText variant='caption' color='primary'>
              {t('charts.collapseAll')}
            </AppText>
          </Pressable>
        </Row>
      ) : null}
      {children}
    </Stack>
  );
};
