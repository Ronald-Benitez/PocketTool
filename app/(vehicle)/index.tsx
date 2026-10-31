import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  useVehicleFuelRepository,
  useVehicleMaintenanceRepository,
  useVehicleRemindersRepository,
} from '@/src/db';
import { VehicleForm } from '@/src/components/vehicle/VehicleForm';
import { buildFuelStats } from '@/src/domain/vehicle/fuel';
import { buildMonthlySpendChart } from '@/src/domain/vehicle/charts';
import { buildReminderStatus, latestOdometerKm } from '@/src/domain/vehicle/reminders';
import {
  consumptionUnits,
  distanceUnitOf,
  fromKm,
  selectConsumption,
} from '@/src/domain/vehicle/units';
import type {
  VehicleFuelEntryView,
  VehicleMaintenanceView,
} from '@/src/db/repositories/vehicle';
import { useVehicle } from '@/src/hooks/useVehicle';
import type { Vehicle, VehicleReminder } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { MermaidChart } from '@/src/ui/charts/MermaidChart';
import { SelectField } from '@/src/ui/forms/SelectField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const Index = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const { vehicles, vehicle, selectVehicle, loading, refresh } = useVehicle();
  const fuelRepository = useVehicleFuelRepository();
  const maintenanceRepository = useVehicleMaintenanceRepository();
  const remindersRepository = useVehicleRemindersRepository();
  const [vehicleFormVisible, setVehicleFormVisible] = useState(false);
  const [formVehicle, setFormVehicle] = useState<Vehicle | null>(null);
  const [fuelEntries, setFuelEntries] = useState<VehicleFuelEntryView[]>([]);
  const [maintenance, setMaintenance] = useState<VehicleMaintenanceView[]>([]);
  const [reminders, setReminders] = useState<VehicleReminder[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      setRefreshKey((value) => value + 1);
    }, [refresh])
  );

  useEffect(() => {
    if (!vehicle?.id) {
      setFuelEntries([]);
      setMaintenance([]);
      setReminders([]);
      return;
    }
    let active = true;
    Promise.all([
      fuelRepository.fetchFuelEntries(vehicle.id),
      maintenanceRepository.fetchMaintenance(vehicle.id),
      remindersRepository.fetchReminders(vehicle.id),
    ]).then(([fuelRows, maintenanceRows, reminderRows]) => {
      if (!active) return;
      setFuelEntries(fuelRows);
      setMaintenance(maintenanceRows);
      setReminders(reminderRows);
    });
    return () => {
      active = false;
    };
  }, [vehicle?.id, refreshKey]);

  const format = (vehicle?.consumption_format as
    | 'mi_gal'
    | 'km_gal'
    | 'mi_l'
    | 'km_l'
    | 'l_100km'
    | 'gal_100km'
    | 'l_60mi'
    | 'gal_60mi') ?? 'mi_gal';
  const stats = useMemo(() => buildFuelStats(fuelEntries, format), [fuelEntries, format]);
  const spendChart = useMemo(
    () => buildMonthlySpendChart(fuelEntries, t('vehicle.chart.spend')),
    [fuelEntries, t]
  );
  const currentOdometerKm = useMemo(
    () => latestOdometerKm(fuelEntries, maintenance),
    [fuelEntries, maintenance]
  );
  const currentOdometer = currentOdometerKm
    ? fromKm(currentOdometerKm, distanceUnitOf(vehicle?.distance_unit))
    : null;
  const averageConsumption = selectConsumption(stats.averageMetrics, format);
  const oilReminder = reminders.find(
    (reminder) => reminder.service_type === 'oil_change' && Boolean(reminder.is_active)
  );
  const oilStatus = oilReminder
    ? buildReminderStatus(oilReminder, currentOdometerKm)
    : null;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthSpend = fuelEntries
    .filter((entry) => entry.date >= monthStart.getTime())
    .reduce((total, entry) => total + entry.total_cost, 0);

  if (loading && vehicles.length === 0) {
    return (
      <Screen>
        <LoadingState message={t('vehicle.title')} fullScreen />
      </Screen>
    );
  }

  if (vehicles.length === 0) {
    return (
      <Screen scroll>
        <Stack gap='lg'>
          <EmptyState
            title={t('vehicle.empty.noVehiclesTitle')}
            description={t('vehicle.empty.noVehiclesBody')}
            icon={<MaterialIcons name='directions-car' size={28} color={colors.textMuted} />}
            action={
              <Button
                label={t('vehicle.actions.addVehicle')}
                onPress={() => {
                  setFormVehicle(null);
                  setVehicleFormVisible(true);
                }}
              />
            }
          />
        </Stack>
        <VehicleForm
          visible={vehicleFormVisible}
          vehicle={formVehicle}
          onClose={() => setVehicleFormVisible(false)}
          onSaved={() => {
            void refresh();
            setRefreshKey((value) => value + 1);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['left', 'right']}>
      <Stack gap='lg'>
        <Row justify='space-between' align='center' gap='md'>
          <View style={{ flex: 1 }}>
            <SelectField
              value={vehicle?.id}
              options={vehicles.flatMap((item) =>
                item.id === undefined ? [] : [{ label: item.name, value: item.id }]
              )}
              onChange={selectVehicle}
            />
          </View>
          <Button
            label={t('vehicle.actions.addVehicle')}
            size='sm'
            variant='outline'
            onPress={() => {
              setFormVehicle(null);
              setVehicleFormVisible(true);
            }}
          />
          {vehicle ? (
            <Button
              label={t('vehicle.actions.editVehicle')}
              size='sm'
              variant='ghost'
              onPress={() => {
                setFormVehicle(vehicle);
                setVehicleFormVisible(true);
              }}
            />
          ) : null}
        </Row>

        <Surface variant='raised' padding='lg'>
          <Stack gap='md'>
            <Row gap='md' justify='space-between'>
              <SummaryBlock
                label={t('vehicle.stats.currentOdometer')}
                value={
                  currentOdometer != null
                    ? `${currentOdometer.toFixed(0)} ${t(
                        vehicle?.distance_unit === 'km'
                          ? 'vehicle.vehicle.kilometers'
                          : 'vehicle.vehicle.miles'
                      )}`
                    : t('vehicle.stats.noData')
                }
                size='lg'
                style={{ flex: 1 }}
              />
              <SummaryBlock
                label={t('vehicle.stats.averageConsumption')}
                value={
                  averageConsumption != null
                    ? `${averageConsumption.toFixed(2)} ${consumptionUnits(format)}`
                    : t('vehicle.stats.noData')
                }
                size='lg'
                accentColor={colors.chartPlanned}
                style={{ flex: 1 }}
              />
            </Row>
            <Row gap='md' justify='space-between'>
              <SummaryBlock
                label={t('vehicle.stats.monthSpend')}
                cents={monthSpend}
                size='md'
                accentColor={colors.expense}
                style={{ flex: 1 }}
              />
              <SummaryBlock
                label={t('vehicle.stats.nextOilChange')}
                value={
                  oilStatus?.remainingDistance != null
                    ? `${oilStatus.remainingDistance.toFixed(0)} ${
                        vehicle?.distance_unit === 'km'
                          ? t('vehicle.vehicle.kilometers')
                          : t('vehicle.vehicle.miles')
                      }`
                    : t('vehicle.stats.noData')
                }
                size='md'
                accentColor={colors.warning}
                style={{ flex: 1 }}
              />
            </Row>
            <Row gap='sm' wrap>
              <Button
                label={t('vehicle.actions.addFuel')}
                size='sm'
                onPress={() => router.push('/(vehicle)/fuel' as never)}
              />
              <Button
                label={t('vehicle.actions.addMaintenance')}
                size='sm'
                variant='outline'
                onPress={() => router.push('/(vehicle)/maintenance' as never)}
              />
              <Button
                label={t('vehicle.actions.addReminder')}
                size='sm'
                variant='ghost'
                onPress={() => router.push('/(vehicle)/reminders' as never)}
              />
            </Row>
          </Stack>
        </Surface>

        {spendChart ? (
          <MermaidChart
            definition={spendChart}
            height={260}
            accessibilityLabel={t('vehicle.chart.spend')}
            palette={[colors.chartFuelCost]}
            legend={[
              { label: t('vehicle.chart.spend'), color: colors.chartFuelCost },
            ]}
            fallback={<AppText color='muted'>{t('vehicle.chart.noData')}</AppText>}
          />
        ) : null}

        <Stack gap='sm'>
          <AppText variant='subtitle'>{t('vehicle.fuel.title')}</AppText>
          {fuelEntries.length === 0 ? (
            <AppText color='muted'>{t('vehicle.fuel.empty')}</AppText>
          ) : (
            <Surface variant='outlined' padding='none'>
              {fuelEntries.slice(0, 4).map((entry, index) => {
                const analysis = stats.entries.find((item) => item.entry.id === entry.id);
                const value = selectConsumption(
                  analysis?.segmentMetrics ?? analysis?.metrics ?? null,
                  format
                );
                return (
                  <ListItem
                    key={entry.id}
                    title={new Date(entry.date).toLocaleDateString()}
                    subtitle={`${entry.volume.toFixed(3)} ${
                      entry.volume_unit === 'L'
                        ? t('vehicle.vehicle.liters')
                        : t('vehicle.vehicle.gallons')
                    } · ${formatMoneyWithSymbol(entry.total_cost)}`}
                    trailing={
                      <AppText variant='caption' color='muted'>
                        {value != null
                          ? `${value.toFixed(2)} ${consumptionUnits(format)}`
                          : t('vehicle.fuel.accumulating')}
                      </AppText>
                    }
                    showDivider={index < Math.min(fuelEntries.length, 4) - 1}
                  />
                );
              })}
            </Surface>
          )}
        </Stack>
      </Stack>

      <VehicleForm
        visible={vehicleFormVisible}
        vehicle={formVehicle}
        onClose={() => setVehicleFormVisible(false)}
        onSaved={() => {
          void refresh();
          setRefreshKey((value) => value + 1);
        }}
      />
    </Screen>
  );
};

export default Index;
