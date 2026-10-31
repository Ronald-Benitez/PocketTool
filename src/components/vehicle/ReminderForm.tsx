import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  useVehicleMaintenanceRepository,
  useVehicleRemindersRepository,
} from '@/src/db';
import type { VehicleMaintenanceView } from '@/src/db/repositories/vehicle';
import type { Vehicle, VehicleReminder } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { DateField } from '@/src/ui/forms/DateField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { Modal } from '@/src/ui/overlays/Modal';

export type ReminderInitialData = {
  service_type?: string;
  title?: string;
  last_service_date?: number | null;
  last_service_odometer?: number | null;
  odometer_unit?: string | null;
};

type ReminderFormProps = {
  visible: boolean;
  vehicle: Vehicle;
  reminder?: VehicleReminder | null;
  initialData?: ReminderInitialData | null;
  replaceActiveForType?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

const serviceTypes = [
  'oil_change',
  'tires',
  'filter',
  'brakes',
  'battery',
  'inspection',
  'repair',
  'other',
] as const;

export const ReminderForm = ({
  visible,
  vehicle,
  reminder,
  initialData,
  replaceActiveForType = null,
  onClose,
  onSaved,
}: ReminderFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useVehicleRemindersRepository();
  const maintenanceRepository = useVehicleMaintenanceRepository();
  const [maintenanceEntries, setMaintenanceEntries] = useState<VehicleMaintenanceView[]>([]);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState<(typeof serviceTypes)[number]>('oil_change');
  const [title, setTitle] = useState('');
  const [intervalDistance, setIntervalDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi');
  const [intervalMonths, setIntervalMonths] = useState('');
  const [lastServiceDate, setLastServiceDate] = useState<number | null>(null);
  const [lastServiceOdometer, setLastServiceOdometer] = useState('');
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const source = reminder ?? initialData;
    setServiceType(
      (source?.service_type as (typeof serviceTypes)[number]) ?? 'oil_change'
    );
    setTitle(source?.title ?? '');
    setIntervalDistance(reminder?.interval_distance?.toString() ?? '');
    setDistanceUnit(
      (reminder?.interval_distance_unit ?? initialData?.odometer_unit) === 'km'
        ? 'km'
        : 'mi'
    );
    setIntervalMonths(reminder?.interval_months?.toString() ?? '');
    setLastServiceDate(
      reminder?.last_service_date ?? initialData?.last_service_date ?? null
    );
    setLastServiceOdometer(
      (reminder?.last_service_odometer ?? initialData?.last_service_odometer)?.toString() ??
        ''
    );
    setActive(reminder ? Boolean(reminder.is_active) : true);
    setNotes(reminder?.notes ?? '');
    setSelectedMaintenanceId(null);
    setError(null);
  }, [visible, reminder, initialData]);

  useEffect(() => {
    if (!visible || !vehicle.id) return;
    let active = true;
    maintenanceRepository.fetchMaintenance(vehicle.id).then((rows) => {
      if (active) setMaintenanceEntries(rows);
    });
    return () => {
      active = false;
    };
  }, [visible, vehicle.id]);

  const applyMaintenance = (maintenanceId: number) => {
    setSelectedMaintenanceId(maintenanceId);
    const source = maintenanceEntries.find((entry) => entry.id === maintenanceId);
    if (!source) return;
    setServiceType(source.service_type as (typeof serviceTypes)[number]);
    setTitle(source.title);
    setLastServiceDate(source.date);
    setLastServiceOdometer(source.odometer?.toString() ?? '');
    setDistanceUnit(source.distance_unit === 'km' ? 'km' : 'mi');
    setError(null);
  };

  const save = async () => {
    if (!vehicle.id || !title.trim()) {
      setError(t('vehicle.toast.empty'));
      return;
    }
    if (!intervalDistance.trim() && !intervalMonths.trim()) {
      setError(t('vehicle.reminders.intervalRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const savedId = await repository.saveReminder({
        id: reminder?.id,
        vehicle_id: vehicle.id,
        service_type: serviceType,
        title: title.trim(),
        interval_distance: intervalDistance.trim() ? Number(intervalDistance) : null,
        interval_distance_unit: intervalDistance.trim() ? distanceUnit : null,
        interval_months: intervalMonths.trim() ? Number(intervalMonths) : null,
        last_service_date: lastServiceDate,
        last_service_odometer: lastServiceOdometer.trim()
          ? Number(lastServiceOdometer)
          : null,
        odometer_unit: lastServiceOdometer.trim() ? distanceUnit : null,
        is_active: active ? 1 : 0,
        notes: notes.trim() || null,
      });
      if (replaceActiveForType && vehicle.id) {
        await repository.deactivateReminders(
          vehicle.id,
          replaceActiveForType,
          savedId
        );
      }
      showToast({ message: t('vehicle.toast.saved'), type: 'success' });
      onSaved();
      onClose();
    } catch (cause) {
      if (__DEV__) console.warn('[vehicle] reminder save failed', cause);
      setError(t('vehicle.toast.error'));
      showToast({ message: t('vehicle.toast.error'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!reminder?.id) return;
    setSaving(true);
    try {
      await repository.deleteReminder(reminder.id);
      setConfirmDelete(false);
      showToast({ message: t('vehicle.toast.deleted'), type: 'success' });
      onSaved();
      onClose();
    } catch {
      setError(t('vehicle.toast.error'));
    } finally {
      setSaving(false);
    }
  };

  const maintenanceOptions = maintenanceEntries.flatMap((entry) =>
    entry.id === undefined
      ? []
      : [
          {
            value: entry.id,
            label: `${entry.title} · ${new Date(entry.date).toLocaleDateString()}`,
          },
        ]
  );

  return (
    <>
      <Modal
        visible={visible}
        onClose={onClose}
        title={reminder ? t('vehicle.reminders.editTitle') : t('vehicle.reminders.addTitle')}
        closeLabel={t('vehicle.actions.cancel')}
        scrollable
        footer={
          <View style={styles.footer}>
            {reminder ? (
              <Button
                label={t('vehicle.actions.delete')}
                variant='danger'
                onPress={() => setConfirmDelete(true)}
                style={styles.footerButton}
              />
            ) : null}
            <Button
              label={t('vehicle.actions.cancel')}
              variant='outline'
              onPress={onClose}
              style={styles.footerButton}
            />
            <Button
              label={t('vehicle.actions.save')}
              onPress={save}
              loading={saving}
              style={styles.footerButton}
            />
          </View>
        }
      >
        <View style={styles.form}>
          {error ? <InlineMessage variant='error' message={error} /> : null}
          {maintenanceOptions.length > 0 ? (
            <SelectField
              label={t('vehicle.reminders.sourceMaintenance')}
              value={selectedMaintenanceId}
              options={maintenanceOptions}
              onChange={applyMaintenance}
              placeholder={t('vehicle.reminders.sourceMaintenancePlaceholder')}
              searchable
              hint={t('vehicle.reminders.sourceMaintenanceHint')}
            />
          ) : null}
          <SelectField
            label={t('vehicle.reminders.serviceType')}
            value={serviceType}
            options={serviceTypes.map((type) => ({
              label: t(`vehicle.serviceTypes.${type}` as never),
              value: type,
            }))}
            onChange={setServiceType}
          />
          <TextField
            label={t('vehicle.reminders.titleField')}
            required
            value={title}
            onChangeText={setTitle}
          />
          <TextField
            label={t('vehicle.reminders.intervalDistance')}
            value={intervalDistance}
            onChangeText={setIntervalDistance}
            keyboardType='decimal-pad'
          />
          <SelectField
            label={t('vehicle.vehicle.distanceUnit')}
            value={distanceUnit}
            options={[
              { label: t('vehicle.vehicle.miles'), value: 'mi' },
              { label: t('vehicle.vehicle.kilometers'), value: 'km' },
            ]}
            onChange={setDistanceUnit}
          />
          <TextField
            label={t('vehicle.reminders.intervalMonths')}
            value={intervalMonths}
            onChangeText={setIntervalMonths}
            keyboardType='number-pad'
          />
          <DateField
            label={t('vehicle.reminders.lastServiceDate')}
            value={lastServiceDate}
            onChange={setLastServiceDate}
          />
          <TextField
            label={t('vehicle.reminders.lastServiceOdometer')}
            value={lastServiceOdometer}
            onChangeText={setLastServiceOdometer}
            keyboardType='decimal-pad'
          />
          <SwitchField
            label={t('vehicle.reminders.active')}
            value={active}
            onChange={setActive}
          />
          <TextField
            label={t('vehicle.vehicle.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </Modal>
      <ConfirmDialog
        visible={confirmDelete}
        title={t('vehicle.actions.delete')}
        message={t('vehicle.confirm.deleteReminder')}
        confirmLabel={t('vehicle.actions.delete')}
        cancelLabel={t('vehicle.actions.cancel')}
        tone='danger'
        loading={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  form: { gap: 16 },
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});

