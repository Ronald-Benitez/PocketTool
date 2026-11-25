import React, { useEffect, useRef, useState } from 'react';

import {
  useVehicleRemindersRepository,
  useVehiclesRepository,
} from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import type { Vehicle, VehicleReminder } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useDashboardRefresh } from '@/src/components/dashboard/DashboardRefreshContext';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { StatTile } from '@/src/ui/data-display/StatTile';
import { AppText } from '@/src/ui/primitives/AppText';

export const DashboardVehicleBlock = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const vehiclesRepository = useVehiclesRepository();
  const remindersRepository = useVehicleRemindersRepository();
  const repositoriesRef = useRef({ vehiclesRepository, remindersRepository });
  repositoriesRef.current = { vehiclesRepository, remindersRepository };
  const { refreshKey } = useDashboardRefresh();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState<VehicleReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      repositoriesRef.current.vehiclesRepository.fetchVehicles(),
      repositoriesRef.current.remindersRepository.fetchReminders(),
    ])
      .then(([vehicleRows, reminderRows]) => {
        if (!active) return;
        setVehicles(vehicleRows);
        setReminders(reminderRows);
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[dashboard] vehicle load failed', cause);
        const mapped = mapDatabaseError(cause, t('toast.error'));
        showToast({
          message: t(`dbErrors.${mapped.code}` as never),
          type: 'error',
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey, showToast, t]);

  if (loading) return <LoadingState />;

  const next = reminders
    .filter((reminder) => Boolean(reminder.is_active) && reminder.next_due_date)
    .sort(
      (left, right) => (left.next_due_date ?? 0) - (right.next_due_date ?? 0)
    )[0];

  if (!next?.next_due_date) {
    return (
      <AppText variant='caption' color='muted'>
        {t('dashboard.noVehicle')}
      </AppText>
    );
  }

  const vehicle = vehicles.find((item) => item.id === next.vehicle_id);
  const hint = [next.title, vehicle?.name].filter(Boolean).join(' · ');

  return (
    <StatTile
      label={t('dashboard.nextReminder')}
      value={new Date(next.next_due_date).toLocaleDateString()}
      hint={hint}
      size='md'
    />
  );
};
