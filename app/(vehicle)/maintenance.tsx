import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

import { useVehicleMaintenanceRepository } from '@/src/db';
import { MaintenanceForm } from '@/src/components/vehicle/MaintenanceForm';
import type { VehicleMaintenanceView } from '@/src/db/repositories/vehicle';
import { useVehicle } from '@/src/hooks/useVehicle';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Badge } from '@/src/ui/data-display/Badge';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { Button } from '@/src/ui/actions/Button';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { AppText } from '@/src/ui/primitives/AppText';
import { Screen } from '@/src/ui/primitives/Screen';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const MaintenanceScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { vehicle } = useVehicle();
  const repository = useVehicleMaintenanceRepository();
  const [entries, setEntries] = useState<VehicleMaintenanceView[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [selected, setSelected] = useState<VehicleMaintenanceView | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <Stack gap='lg'>
        <Row justify='space-between' align='flex-start' gap='md'>
          <Stack gap='xxs' style={{ flex: 1 }}>
            <AppText variant='title'>{t('vehicle.maintenance.title')}</AppText>
            <AppText color='muted'>{t('vehicle.maintenance.subtitle')}</AppText>
          </Stack>
          <Button
            label={t('vehicle.actions.addMaintenance')}
            size='sm'
            onPress={() => {
              setSelected(null);
              setFormVisible(true);
            }}
          />
        </Row>

        {entries.length === 0 ? (
          <EmptyState
            title={t('vehicle.maintenance.empty')}
            icon={<MaterialIcons name='build' size={28} color={colors.textMuted} />}
          />
        ) : (
          <Surface variant='outlined' padding='none'>
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
          </Surface>
        )}
      </Stack>

      <MaintenanceForm
        visible={formVisible}
        vehicle={vehicle}
        entry={selected}
        onClose={() => setFormVisible(false)}
        onSaved={() => setRefreshKey((value) => value + 1)}
      />
    </Screen>
  );
};

export default MaintenanceScreen;
