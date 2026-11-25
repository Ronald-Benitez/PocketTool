import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

import { useVehicleMaintenanceRepository } from '@/src/db';
import {
  MaintenanceForm,
  type MaintenanceReminderRequest,
} from '@/src/components/vehicle/MaintenanceForm';
import {
  ReminderForm,
  type ReminderInitialData,
} from '@/src/components/vehicle/ReminderForm';
import type { VehicleMaintenanceView } from '@/src/db/repositories/vehicle';
import { useVehicle } from '@/src/hooks/useVehicle';
import { useGroupRefresh } from '@/src/hooks/useGroupRefresh';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Badge } from '@/src/ui/data-display/Badge';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SectionCard } from '@/src/ui/data-display/SectionCard';
import { LinkButton } from '@/src/ui/actions/LinkButton';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const MaintenanceScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { vehicle } = useVehicle();
  const { group } = useRecordsStore();
  const { refreshGroupData } = useGroupRefresh();
  const repository = useVehicleMaintenanceRepository();
  const [entries, setEntries] = useState<VehicleMaintenanceView[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [selected, setSelected] = useState<VehicleMaintenanceView | null>(null);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [reminderInitialData, setReminderInitialData] =
    useState<ReminderInitialData | null>(null);
  const [replaceActiveType, setReplaceActiveType] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateReminder = (request: MaintenanceReminderRequest) => {
    setReminderInitialData(request.initialData);
    setReplaceActiveType(request.replaceActiveType);
    setReminderVisible(true);
  };

  useEffect(() => {
    if (!vehicle?.id) {
      setEntries([]);
      return;
    }
    let active = true;
    repository.fetchMaintenance(vehicle.id).then((rows) => {
      if (active) setEntries(rows);
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
      <Stack gap='xl'>
        <SectionCard
          title={t('vehicle.maintenance.title')}
          tooltip={{
            title: t('vehicle.maintenance.title'),
            body: t('vehicle.maintenance.subtitle'),
          }}
          action={
            <LinkButton
              label={t('vehicle.actions.addMaintenance')}
              onPress={() => {
                setSelected(null);
                setFormVisible(true);
              }}
            />
          }
          padded={false}
        >
        {entries.length === 0 ? (
          <EmptyState
            title={t('vehicle.maintenance.empty')}
            icon={<MaterialIcons name='build' size={28} color={colors.textMuted} />}
          />
        ) : (
          <>
            {entries.map((entry, index) => (
              <ListItem
                key={entry.id ?? index}
                title={entry.title}
                subtitle={`${new Date(entry.date).toLocaleDateString()} · ${t(
                  `vehicle.serviceTypes.${entry.service_type}` as never
                )}${entry.items.length ? ` · ${entry.items.length} ${t('vehicle.maintenance.items')}` : ''}`}
                leading={<MaterialIcons name='build' size={20} color={colors.chartMaintenanceCost} />}
                trailing={
                  <Stack gap='xxs' align='flex-end'>
                    <AppText>{formatMoneyWithSymbol(entry.cost)}</AppText>
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
                showDivider={index < entries.length - 1}
              />
            ))}
          </>
        )}
        </SectionCard>
      </Stack>

      <MaintenanceForm
        visible={formVisible}
        vehicle={vehicle}
        entry={selected}
        onCreateReminder={handleCreateReminder}
        onClose={() => setFormVisible(false)}
        onSaved={() => {
          setRefreshKey((value) => value + 1);
          if (group?.id) {
            refreshGroupData(group.id).catch((cause) => {
              if (__DEV__) console.warn('[maintenance] group refresh failed', cause);
            });
          }
        }}
      />
      <ReminderForm
        visible={reminderVisible}
        vehicle={vehicle}
        initialData={reminderInitialData}
        replaceActiveForType={replaceActiveType}
        onClose={() => setReminderVisible(false)}
        onSaved={() => {
          setRefreshKey((value) => value + 1);
          if (group?.id) {
            refreshGroupData(group.id).catch((cause) => {
              if (__DEV__) console.warn('[maintenance] group refresh failed', cause);
            });
          }
        }}
      />
    </Screen>
  );
};

export default MaintenanceScreen;
