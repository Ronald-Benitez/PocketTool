import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useVehicleFuelRepository } from '@/src/db';
import { FuelEntryForm } from '@/src/components/vehicle/FuelEntryForm';
import { buildFuelStats, groupFuelSegments } from '@/src/domain/vehicle/fuel';
import { buildConsumptionChart } from '@/src/domain/vehicle/charts';
import {
  consumptionUnits,
  selectConsumption,
} from '@/src/domain/vehicle/units';
import { MermaidChart } from '@/src/ui/charts/MermaidChart';
import type { VehicleFuelEntryView } from '@/src/db/repositories/vehicle';
import { useVehicle } from '@/src/hooks/useVehicle';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { SelectField } from '@/src/ui/forms/SelectField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { spacing } from '@/src/ui/theme/tokens';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const formats = [
  'mi_gal',
  'km_gal',
  'mi_l',
  'km_l',
  'l_100km',
  'gal_100km',
  'l_60mi',
  'gal_60mi',
] as const;

const FuelScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { vehicle, loading } = useVehicle();
  const repository = useVehicleFuelRepository();
  const [entries, setEntries] = useState<VehicleFuelEntryView[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [selected, setSelected] = useState<VehicleFuelEntryView | null>(null);
  const [format, setFormat] = useState<(typeof formats)[number]>('mi_gal');
  useEffect(() => {
    if (vehicle?.consumption_format) {
      setFormat(vehicle.consumption_format as (typeof formats)[number]);
    }
  }, [vehicle?.consumption_format]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!vehicle?.id) {
      setEntries([]);
      return;
    }
    let active = true;
    repository.fetchFuelEntries(vehicle.id).then((rows) => {
      if (active) setEntries(rows);
    });
    return () => {
      active = false;
    };
  }, [vehicle?.id, refreshKey]);

  const stats = useMemo(
    () => buildFuelStats(entries, format),
    [entries, format]
  );
  const segments = useMemo(() => groupFuelSegments(entries), [entries]);
  const consumptionChart = useMemo(
    () =>
      buildConsumptionChart(
        stats.entries,
        format,
        t('vehicle.chart.consumption')
      ),
    [stats.entries, format, t]
  );

  if (!vehicle) {
    return (
      <Screen scroll>
        <EmptyState
          title={t('vehicle.empty.noVehiclesTitle')}
          description={t('vehicle.empty.noVehiclesBody')}
          icon={<MaterialIcons name='directions-car' size={28} color={colors.textMuted} />}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['left', 'right']}>
      <Stack gap='lg'>
        <Row justify='space-between' align='flex-start' gap='md'>
          <Stack gap='xxs' style={{ flex: 1 }}>
            <AppText variant='title'>{t('vehicle.fuel.title')}</AppText>
            <AppText color='muted'>{t('vehicle.fuel.subtitle')}</AppText>
          </Stack>
          <Button
            label={t('vehicle.actions.addFuel')}
            size='sm'
            onPress={() => {
              setSelected(null);
              setFormVisible(true);
            }}
          />
        </Row>

        <SelectField
          label={t('vehicle.fuel.consumption')}
          value={format}
          options={formats.map((item) => ({
            label: t(`vehicle.formats.${item}`),
            value: item,
          }))}
          onChange={setFormat}
        />

        <Surface variant='muted' padding='md'>
          <Row justify='space-between'>
            <AppText>
              {t('vehicle.stats.totalSpent')}: {formatMoneyWithSymbol(stats.totalSpentCents)}
            </AppText>
            <AppText>
              {t('vehicle.stats.averageConsumption')}:{' '}
              {selectConsumption(stats.averageMetrics, format)?.toFixed(2) ?? '—'}{' '}
              {consumptionUnits(format)}
            </AppText>
          </Row>
        </Surface>

        {consumptionChart ? (
          <MermaidChart
            definition={consumptionChart}
            height={260}
            accessibilityLabel={t('vehicle.chart.consumption')}
            palette={[colors.chartConsumption]}
            legend={[
              {
                label: `${t('vehicle.chart.consumption')} (${consumptionUnits(format)})`,
                color: colors.chartConsumption,
              },
            ]}
            fallback={<AppText color='muted'>{t('vehicle.chart.noData')}</AppText>}
          />
        ) : null}

        {loading && entries.length === 0 ? (
          <LoadingState message={t('vehicle.fuel.title')} />
        ) : entries.length === 0 ? (
          <EmptyState
            title={t('vehicle.fuel.empty')}
            icon={<MaterialIcons name='local-gas-station' size={28} color={colors.textMuted} />}
          />
        ) : (
          <Stack gap='md'>
            {segments
              .slice()
              .reverse()
              .map((segment) => {
                const value = selectConsumption(segment.metrics, format);
                const startDate = new Date(
                  segment.startEntry.date
                ).toLocaleDateString();
                const endDate = new Date(
                  segment.endEntry.date
                ).toLocaleDateString();
                const title =
                  segment.status === 'complete'
                    ? `${startDate} → ${endDate}`
                    : segment.status === 'in_progress'
                      ? t('vehicle.fuel.segmentSince', { date: startDate })
                      : t('vehicle.fuel.segmentNoBaseline');
                const badgeLabel =
                  segment.status === 'complete'
                    ? t('vehicle.fuel.segmentComplete')
                    : segment.status === 'in_progress'
                      ? t('vehicle.fuel.segmentInProgress')
                      : t('vehicle.fuel.segmentNoBaseline');
                const badgeTone =
                  segment.status === 'complete'
                    ? 'success'
                    : segment.status === 'in_progress'
                      ? 'warning'
                      : 'neutral';
                const fillCount =
                  segment.status === 'complete'
                    ? segment.entries.filter(
                        (item) => item.entry.id !== segment.startEntry.id
                      ).length
                    : segment.entries.length;
                const detail =
                  segment.status === 'complete'
                    ? t('vehicle.fuel.fillUps', { count: fillCount })
                    : segment.status === 'in_progress'
                      ? t('vehicle.fuel.accumulating')
                      : t('vehicle.fuel.segmentNoBaselineHint');

                return (
                  <Surface key={segment.id} variant='outlined' padding='none'>
                    <View style={styles.segmentHeader}>
                      <Row justify='space-between' align='flex-start' gap='sm'>
                        <Stack gap='xxs' style={{ flex: 1 }}>
                          <AppText variant='subtitle'>{title}</AppText>
                          <AppText variant='caption' color='muted'>
                            {detail}
                          </AppText>
                        </Stack>
                        <Badge
                          label={badgeLabel}
                          tone={badgeTone}
                          size='sm'
                        />
                      </Row>
                    </View>
                    {[...segment.entries].reverse().map((analysis, index) => {
                      const entry = analysis.entry as VehicleFuelEntryView;
                      const isFull = Boolean(entry.is_full_tank ?? 1);
                      return (
                        <ListItem
                          key={entry.id ?? `${segment.id}-${index}`}
                          title={new Date(entry.date).toLocaleDateString()}
                          subtitle={`${entry.volume.toFixed(3)} ${
                            entry.volume_unit === 'L'
                              ? t('vehicle.vehicle.liters')
                              : t('vehicle.vehicle.gallons')
                          } · ${formatMoneyWithSymbol(entry.total_cost)}${
                            entry.station ? ` · ${entry.station}` : ''
                          }`}
                          leading={
                            <MaterialIcons
                              name='local-gas-station'
                              size={20}
                              color={colors.chartPlanned}
                            />
                          }
                          trailing={
                            <Stack gap='xxs' align='flex-end'>
                              {segment.status === 'complete' &&
                              entry.id === segment.endEntry.id ? (
                                <AppText variant='caption' color='muted'>
                                  {value != null
                                    ? `${value.toFixed(2)} ${consumptionUnits(format)}`
                                    : t('vehicle.stats.noData')}
                                </AppText>
                              ) : null}
                              <Badge
                                label={
                                  isFull
                                    ? t('vehicle.fuel.fullTank')
                                    : t('vehicle.fuel.partialTank')
                                }
                                tone={isFull ? 'success' : 'warning'}
                                size='sm'
                              />
                              <Badge
                                label={
                                  entry.record_id
                                    ? t('vehicle.records.linked')
                                    : t('vehicle.fuel.recordUnlinked')
                                }
                                tone={entry.record_id ? 'success' : 'neutral'}
                                size='sm'
                              />
                            </Stack>
                          }
                          onPress={() => {
                            setSelected(entry);
                            setFormVisible(true);
                          }}
                          showDivider={index < segment.entries.length - 1}
                        />
                      );
                    })}
                  </Surface>
                );
              })}
          </Stack>
        )}
      </Stack>

      <FuelEntryForm
        visible={formVisible}
        vehicle={vehicle}
        entry={selected}
        onClose={() => setFormVisible(false)}
        onSaved={() => setRefreshKey((value) => value + 1)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  segmentHeader: { padding: spacing.md },
});

export default FuelScreen;
