import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useVehicleRemindersRepository } from '@/src/db';
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

type ReminderFormProps = {
  visible: boolean;
  vehicle: Vehicle;
  reminder?: VehicleReminder | null;
  onClose: () => void;
  onSaved: () => void;
};

const serviceTypes = ['oil_change', 'tires', 'filter', 'brakes', 'inspection', 'other'] as const;

export const ReminderForm = ({
  visible,
  vehicle,
  reminder,
  onClose,
  onSaved,
}: ReminderFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useVehicleRemindersRepository();
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
    setServiceType((reminder?.service_type as (typeof serviceTypes)[number]) ?? 'oil_change');
    setTitle(reminder?.title ?? '');
    setIntervalDistance(reminder?.interval_distance?.toString() ?? '');
    setDistanceUnit(reminder?.interval_distance_unit === 'km' ? 'km' : 'mi');
    setIntervalMonths(reminder?.interval_months?.toString() ?? '');
    setLastServiceDate(reminder?.last_service_date ?? null);
    setLastServiceOdometer(reminder?.last_service_odometer?.toString() ?? '');
    setActive(reminder ? Boolean(reminder.is_active) : true);
    setNotes(reminder?.notes ?? '');
    setError(null);
  }, [visible, reminder]);

  const save = async () => {
    if (!vehicle.id || !title.trim()) {
      setError(t('vehicle.toast.empty'));
      return;
    }
    if (!intervalDistance.trim() && !intervalMonths.trim()) {
      setError(t('vehicle.toast.empty'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await repository.saveReminder({
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
        is_active: active,
        notes: notes.trim() || null,
      });
      showToast({ message: t('vehicle.toast.saved'), type: 'success' });
      onSaved();
      onClose();
    } catch {
      setError(t('vehicle.toast.error'));
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
          {error ? <InlineMessage variant='error' message={error} /> : null}
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

