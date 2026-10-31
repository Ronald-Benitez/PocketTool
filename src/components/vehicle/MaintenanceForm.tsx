import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  useCategories,
  usePaymentMethods,
  useVehicleMaintenanceRepository,
  useVehicleRemindersRepository,
  useVehicleSettingsRepository,
} from '@/src/db';
import type {
  VehicleExpenseOption,
  VehicleMaintenanceView,
} from '@/src/db/repositories/vehicle';
import type { Vehicle, VehicleSetting } from '@/src/interfaces/schema';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { DateField } from '@/src/ui/forms/DateField';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';
import { MaintenanceItemForm, type MaintenanceItemDraft } from './MaintenanceItemForm';
import {
  ReminderForm,
  type ReminderInitialData,
} from './ReminderForm';
import { VehicleExpensePicker } from './VehicleExpensePicker';

type MaintenanceFormProps = {
  visible: boolean;
  vehicle: Vehicle;
  entry?: VehicleMaintenanceView | null;
  onClose: () => void;
  onSaved: () => void;
};

const serviceTypes = [
  'oil_change',
  'tires',
  'brakes',
  'battery',
  'filter',
  'inspection',
  'repair',
  'other',
] as const;

const isSameDay = (left: number, right: number) => {
  const a = new Date(left);
  const b = new Date(right);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const MaintenanceForm = ({
  visible,
  vehicle,
  entry,
  onClose,
  onSaved,
}: MaintenanceFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { group } = useRecordsStore();
  const repository = useVehicleMaintenanceRepository();
  const remindersRepository = useVehicleRemindersRepository();
  const settingsRepository = useVehicleSettingsRepository();
  const categoriesRepository = useCategories();
  const paymentsRepository = usePaymentMethods();
  const [date, setDate] = useState(() => Date.now());
  const [odometer, setOdometer] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi');
  const [serviceType, setServiceType] = useState<(typeof serviceTypes)[number]>('oil_change');
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(0);
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<MaintenanceItemDraft[]>([]);
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceItemDraft | null>(null);
  const [categories, setCategories] = useState<{ id?: number; category_name: string }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ id?: number; method_name: string }[]>([]);
  const [settings, setSettings] = useState<VehicleSetting[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [linkMode, setLinkMode] = useState<'create' | 'link' | 'none'>('create');
  const [linkedRecord, setLinkedRecord] = useState<VehicleExpenseOption | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [createReminder, setCreateReminder] = useState(false);
  const [reminderVisible, setReminderVisible] = useState(false);
  const [reminderInitialData, setReminderInitialData] =
    useState<ReminderInitialData | null>(null);
  const [replaceActiveType, setReplaceActiveType] = useState<string | null>(null);
  const [conflictVisible, setConflictVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDate(entry?.date ?? Date.now());
    setOdometer(entry?.odometer?.toString() ?? '');
    setDistanceUnit(entry?.distance_unit === 'km' ? 'km' : (vehicle.distance_unit === 'km' ? 'km' : 'mi'));
    setServiceType((entry?.service_type as (typeof serviceTypes)[number]) ?? 'oil_change');
    setTitle(entry?.title ?? '');
    setCost(entry?.cost ?? 0);
    setVendor(entry?.vendor ?? '');
    setNotes(entry?.notes ?? '');
    setItems(entry?.items?.map((item) => ({
      name: item.name,
      notes: item.notes,
      quantity: item.quantity,
      unit: item.unit,
      cost: item.cost,
    })) ?? []);
    setLinkMode(entry?.record_id ? 'link' : 'create');
    setLinkedRecord(
      entry?.record_id
        ? {
            id: entry.record_id,
            name: entry.record_name ?? '',
            amount: entry.record_amount ?? 0,
            date: entry.date,
            categoryId: null,
            categoryName: '',
            paymentMethodId: null,
            paymentMethodName: '',
            groupId: null,
            groupName: '',
          }
        : null
    );
    setError(null);
    setCreateReminder(false);
    setReminderVisible(false);
    setReminderInitialData(null);
    setReplaceActiveType(null);
    setConflictVisible(false);
  }, [visible, entry, vehicle.distance_unit]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    Promise.all([
      categoriesRepository.fetchCategories(),
      paymentsRepository.fetchPaymentMethods(),
      settingsRepository.fetchSettings(),
    ]).then(([nextCategories, nextPayments, nextSettings]) => {
      if (!active) return;
      setCategories(nextCategories ?? []);
      setPaymentMethods(nextPayments ?? []);
      setSettings(nextSettings);
      const key =
        serviceType === 'repair' || serviceType === 'tires' || serviceType === 'oil_change'
          ? serviceType
          : 'maintenance';
      const setting = nextSettings.find((item) => item.setting_key === key);
      setCategoryId(
        (current) =>
          current ??
          setting?.category_id ??
          nextCategories?.[0]?.id ??
          null
      );
      setPaymentMethodId(
        (current) =>
          current ??
          setting?.payment_method_id ??
          nextPayments?.[0]?.id ??
          null
      );
    });
    return () => {
      active = false;
    };
  }, [visible, serviceType]);

  useEffect(() => {
    if (!visible) return;
    setGroupId(group?.id ?? null);
  }, [visible, group?.id]);

  const categoryOptions = useMemo(
    () =>
      categories.flatMap((category) =>
        category.id === undefined
          ? []
          : [{ label: category.category_name, value: category.id }]
      ),
    [categories]
  );
  const paymentOptions = useMemo(
    () =>
      paymentMethods.flatMap((method) =>
        method.id === undefined ? [] : [{ label: method.method_name, value: method.id }]
      ),
    [paymentMethods]
  );


  const selectLinkedRecord = (option: VehicleExpenseOption) => {
    setLinkedRecord(option);
    setDate(option.date);
    setCost(option.amount);
  };

  const save = async () => {
    if (!vehicle.id || !title.trim()) {
      setError(t('vehicle.toast.empty'));
      return;
    }
    if (linkMode === 'create' && !groupId) {
      setError(t('vehicle.records.groupRequired'));
      return;
    }
    if (linkMode === 'create' && !categoryId) {
      setError(t('vehicle.records.categoryRequired'));
      return;
    }
    if (linkMode === 'create' && !paymentMethodId) {
      setError(t('vehicle.records.paymentRequired'));
      return;
    }
    if (linkMode === 'link' && !linkedRecord) {
      setError(t('vehicle.records.noResults'));
      return;
    }
    if (linkMode === 'link' && linkedRecord && cost !== linkedRecord.amount) {
      setError(t('vehicle.records.amountMismatch'));
      return;
    }
    if (
      linkMode === 'link' &&
      linkedRecord &&
      !isSameDay(date, linkedRecord.date)
    ) {
      setError(t('vehicle.records.dateMismatch'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await repository.saveMaintenance({
        id: entry?.id,
        vehicle_id: vehicle.id,
        date,
        odometer: odometer.trim() ? Number(odometer) : null,
        distance_unit: distanceUnit,
        service_type: serviceType,
        title: title.trim(),
        cost,
        vendor: vendor.trim() || null,
        notes: notes.trim() || null,
        items,
        finance: {
          linkMode,
          recordId: linkedRecord?.id,
          groupId,
          categoryId,
          paymentMethodId,
        },
      });
    } catch (cause) {
      if (__DEV__) console.warn('[vehicle] maintenance save failed', cause);
      const message = cause instanceof Error ? cause.message : '';
      setError(
        message === 'GROUP_REQUIRED'
          ? t('vehicle.records.groupRequired')
          : message === 'CATEGORY_REQUIRED'
            ? t('vehicle.records.categoryRequired')
            : message === 'PAYMENT_METHOD_REQUIRED'
              ? t('vehicle.records.paymentRequired')
              : t('vehicle.toast.error')
      );
      setSaving(false);
      return;
    }

    showToast({ message: t('vehicle.toast.saved'), type: 'success' });
    onSaved();

    if (!createReminder || !vehicle.id) {
      setSaving(false);
      onClose();
      return;
    }

    const draft: ReminderInitialData = {
      service_type: serviceType,
      title: title.trim(),
      last_service_date: date,
      last_service_odometer: odometer.trim() ? Number(odometer) : null,
      odometer_unit: odometer.trim() ? distanceUnit : null,
    };
    setReminderInitialData(draft);

    try {
      const existing = await remindersRepository.findActiveReminder(
        vehicle.id,
        serviceType
      );
      if (existing) {
        setReplaceActiveType(serviceType);
        setConflictVisible(true);
      } else {
        setReplaceActiveType(null);
        setReminderVisible(true);
        onClose();
      }
    } catch (cause) {
      if (__DEV__) console.warn('[vehicle] reminder lookup failed', cause);
      setReplaceActiveType(null);
      setReminderVisible(true);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!entry?.id) return;
    setSaving(true);
    try {
      await repository.deleteMaintenance(entry.id, false);
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
        title={entry ? t('vehicle.maintenance.editTitle') : t('vehicle.maintenance.addTitle')}
        closeLabel={t('vehicle.actions.cancel')}
        scrollable
        footer={
          <View style={styles.footer}>
            {entry ? (
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
          <DateField label={t('vehicle.maintenance.date')} value={date} onChange={setDate} />
          <SelectField
            label={t('vehicle.records.mode')}
            value={linkMode}
            options={[
              { label: t('vehicle.records.create'), value: 'create' },
              { label: t('vehicle.records.link'), value: 'link' },
              { label: t('vehicle.records.none'), value: 'none' },
            ]}
            onChange={(value) => {
              setLinkMode(value);
              if (value === 'link') setPickerVisible(true);
              if (value !== 'link') setLinkedRecord(null);
            }}
          />
          {linkMode === 'link' ? (
            <Button
              label={
                linkedRecord
                  ? t('vehicle.records.linkedTo', { name: linkedRecord.name })
                  : t('vehicle.actions.chooseRecord')
              }
              variant='outline'
              onPress={() => setPickerVisible(true)}
            />
          ) : null}
          <TextField
            label={t('vehicle.maintenance.odometer')}
            value={odometer}
            onChangeText={setOdometer}
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
          <SelectField
            label={t('vehicle.maintenance.serviceType')}
            value={serviceType}
            options={serviceTypes.map((type) => ({
              label: t(`vehicle.serviceTypes.${type}` as never),
              value: type,
            }))}
            onChange={setServiceType}
          />
          <TextField
            label={t('vehicle.maintenance.titleField')}
            required
            value={title}
            onChangeText={setTitle}
          />
          <MoneyField
            label={t('vehicle.maintenance.cost')}
            value={cost}
            onChangeCents={setCost}
          />
          <TextField
            label={t('vehicle.maintenance.vendor')}
            value={vendor}
            onChangeText={setVendor}
          />
          <TextField
            label={t('vehicle.maintenance.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
          <SwitchField
            label={t('vehicle.maintenance.createReminder')}
            description={t('vehicle.maintenance.createReminderHint')}
            value={createReminder}
            onChange={setCreateReminder}
          />
          <Stack gap='sm'>
            <Button
              label={t('vehicle.maintenance.addItem')}
              variant='outline'
              onPress={() => {
                setEditingItem(null);
                setItemFormVisible(true);
              }}
            />
            {items.map((item, index) => (
              <ListItem
                key={`${item.name}-${index}`}
                title={item.name}
                subtitle={item.notes || undefined}
                trailing={
                  <Button
                    label={t('vehicle.actions.edit')}
                    variant='ghost'
                    size='sm'
                    onPress={() => {
                      setEditingItem(item);
                      setItemFormVisible(true);
                    }}
                  />
                }
                showDivider={index < items.length - 1}
              />
            ))}
          </Stack>
          {linkMode === 'create' ? (
            <>
              <SelectField
                label={t('vehicle.records.category')}
                value={categoryId}
                options={categoryOptions}
                onChange={setCategoryId}
                searchable
              />
              <SelectField
                label={t('vehicle.records.paymentMethod')}
                value={paymentMethodId}
                options={paymentOptions}
                onChange={setPaymentMethodId}
              />
              {group ? (
                <AppText variant='caption' color='muted'>
                  {t('vehicle.records.group')}: {group.group_name}
                </AppText>
              ) : (
                <InlineMessage variant='warning' message={t('vehicle.records.groupRequired')} />
              )}
            </>
          ) : null}
          {error ? <InlineMessage variant='error' message={error} /> : null}
        </View>
      </Modal>
      <MaintenanceItemForm
        visible={itemFormVisible}
        item={editingItem}
        onClose={() => setItemFormVisible(false)}
        onSave={(item) => {
          setItems((current) => {
            if (editingItem) {
              return current.map((value) => (value === editingItem ? item : value));
            }
            return [...current, item];
          });
        }}
      />
      <VehicleExpensePicker
        visible={pickerVisible}
        date={date}
        amount={cost}
        onClose={() => setPickerVisible(false)}
        onSelect={selectLinkedRecord}
      />
      <ConfirmDialog
        visible={confirmDelete}
        title={t('vehicle.actions.delete')}
        message={t('vehicle.confirm.deleteMaintenance')}
        confirmLabel={t('vehicle.actions.delete')}
        cancelLabel={t('vehicle.actions.cancel')}
        tone='danger'
        loading={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        visible={conflictVisible}
        title={t('vehicle.confirm.replaceReminderTitle')}
        message={t('vehicle.confirm.replaceReminder', {
          type: t(`vehicle.serviceTypes.${serviceType}` as never),
        })}
        confirmLabel={t('vehicle.confirm.replaceReminderConfirm')}
        cancelLabel={t('vehicle.confirm.replaceReminderCancel')}
        onConfirm={() => {
          setConflictVisible(false);
          setReminderVisible(true);
          onClose();
        }}
        onCancel={() => {
          setConflictVisible(false);
          onClose();
        }}
      />
      <ReminderForm
        visible={reminderVisible}
        vehicle={vehicle}
        initialData={reminderInitialData}
        replaceActiveForType={replaceActiveType}
        onClose={() => setReminderVisible(false)}
        onSaved={onSaved}
      />
    </>
  );
};

const styles = StyleSheet.create({
  form: { gap: 16 },
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});


