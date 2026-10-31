import React, { useCallback, useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import {
  useVehicleFuelRepository,
  useVehicleMaintenanceRepository,
  useVehicleRemindersRepository,
} from '@/src/db';
import { ReminderForm } from '@/src/components/vehicle/ReminderForm';
import { buildReminderStatus, latestOdometerKm } from '@/src/domain/vehicle/reminders';
import type { VehicleReminder } from '@/src/interfaces/schema';
import { useVehicle } from '@/src/hooks/useVehicle';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Badge, type BadgeTone } from '@/src/ui/data-display/Badge';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { Button } from '@/src/ui/actions/Button';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const toneFor = (status: string): BadgeTone => {
  if (status === 'overdue') return 'danger';
  if (status === 'due_soon') return 'warning';
  if (status === 'no_data') return 'neutral';
  return 'success';
};

const labelFor = (t: ReturnType<typeof useLanguage>['t'], status: string) => {
  if (status === 'overdue') return t('vehicle.reminders.statusOverdue');
  if (status === 'due_soon') return t('vehicle.reminders.statusDueSoon');
  if (status === 'no_data') return t('vehicle.reminders.statusNoData');
  return t('vehicle.reminders.statusOk');
};

const RemindersScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { vehicle } = useVehicle();
  const remindersRepository = useVehicleRemindersRepository();
  const fuelRepository = useVehicleFuelRepository();
  const maintenanceRepository = useVehicleMaintenanceRepository();
  const [reminders, setReminders] = useState<VehicleReminder[]>([]);
  const [currentOdometerKm, setCurrentOdometerKm] = useState<number | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [selected, setSelected] = useState<VehicleReminder | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((value) => value + 1);
    }, [])
  );

  useEffect(() => {
    if (!vehicle?.id) {
      setReminders([]);
      setCurrentOdometerKm(null);
      return;
    }
    let active = true;
    Promise.all([
      remindersRepository.fetchReminders(vehicle.id),
      fuelRepository.fetchFuelEntries(vehicle.id),
      maintenanceRepository.fetchMaintenance(vehicle.id),
    ]).then(([rows, fuel, maintenance]) => {
      if (!active) return;
      setReminders(rows);
      setCurrentOdometerKm(latestOdometerKm(fuel, maintenance));
    });
    return () => {
      active = false;
    };
  }, [vehicle?.id, refreshKey]);

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
            <AppText variant='title'>{t('vehicle.reminders.title')}</AppText>
            <AppText color='muted'>{t('vehicle.reminders.subtitle')}</AppText>
          </Stack>
          <Button
            label={t('vehicle.actions.addReminder')}
            size='sm'
            onPress={() => {
              setSelected(null);
              setFormVisible(true);
            }}
          />
        </Row>

        {reminders.length === 0 ? (
          <EmptyState
            title={t('vehicle.reminders.empty')}
            icon={<MaterialIcons name='event-repeat' size={28} color={colors.textMuted} />}
          />
        ) : (
          <Surface variant='outlined' padding='none'>
            {reminders.map((reminder, index) => {
              const status = buildReminderStatus(reminder, currentOdometerKm);
              const unit = reminder.odometer_unit === 'km'
                ? t('vehicle.vehicle.kilometers')
                : t('vehicle.vehicle.miles');
              return (
                <ListItem
                  key={reminder.id ?? index}
                  title={reminder.title}
                  subtitle={`${t(
                    `vehicle.serviceTypes.${reminder.service_type}` as never
                  )}${
                    status.remainingDistance != null
                      ? ` · ${status.remainingDistance.toFixed(0)} ${unit}`
                      : ''
                  }${
                    status.remainingDays != null
                      ? ` · ${status.remainingDays} ${t('vehicle.reminders.remainingDays')}`
                      : ''
                  }`}
                  leading={<MaterialIcons name='event-repeat' size={20} color={colors.info} />}
                  trailing={
                    <Badge
                      label={labelFor(t, status.status)}
                      tone={toneFor(status.status)}
                      size='sm'
                    />
                  }
                  onPress={() => {
                    setSelected(reminder);
                    setFormVisible(true);
                  }}
                  showDivider={index < reminders.length - 1}
                />
              );
            })}
          </Surface>
        )}
      </Stack>

      <ReminderForm
        visible={formVisible}
        vehicle={vehicle}
        reminder={selected}
        onClose={() => setFormVisible(false)}
        onSaved={() => setRefreshKey((value) => value + 1)}
      />
    </Screen>
  );
};

export default RemindersScreen;
