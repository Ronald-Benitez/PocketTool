import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  useCategories,
  usePaymentMethods,
  useVehicleFuelRepository,
  useVehicleSettingsRepository,
} from '@/src/db';
import type { VehicleFuelEntryView } from '@/src/db/repositories/vehicle';
import type { VehicleExpenseOption } from '@/src/db/repositories/vehicle';
import type { Vehicle, VehicleSetting } from '@/src/interfaces/schema';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
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
import { VehicleExpensePicker } from './VehicleExpensePicker';

type FuelEntryFormProps = {
  visible: boolean;
  vehicle: Vehicle;
  entry?: VehicleFuelEntryView | null;
  onClose: () => void;
  onSaved: () => void;
};

const parseNumber = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
};

const isSameDay = (left: number, right: number) => {
  const a = new Date(left);
  const b = new Date(right);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const FuelEntryForm = ({
  visible,
  vehicle,
  entry,
  onClose,
  onSaved,
}: FuelEntryFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { group } = useRecordsStore();
  const repository = useVehicleFuelRepository();
  const settingsRepository = useVehicleSettingsRepository();
  const categoriesRepository = useCategories();
  const paymentsRepository = usePaymentMethods();
  const [date, setDate] = useState(() => Date.now());
  const [odometerMode, setOdometerMode] = useState<'odometer' | 'distance'>('odometer');
  const [odometer, setOdometer] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi');
  const [volume, setVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState<'gal' | 'L'>('gal');
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [inferredField, setInferredField] = useState<
    'volume' | 'price' | 'total' | null
  >(null);
  const [isFullTank, setIsFullTank] = useState(true);
  const [station, setStation] = useState('');
  const [notes, setNotes] = useState('');
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

  useEffect(() => {
    if (!visible) return;
    setDate(entry?.date ?? Date.now());
    setOdometerMode(entry?.odometer != null ? 'odometer' : 'distance');
    setOdometer(entry?.odometer?.toString() ?? '');
    setDistance(entry?.distance_traveled?.toString() ?? '');
    setDistanceUnit(entry?.distance_unit === 'km' ? 'km' : (vehicle.distance_unit === 'km' ? 'km' : 'mi'));
    setVolume(entry?.volume?.toString() ?? '');
    setVolumeUnit(entry?.volume_unit === 'L' ? 'L' : (vehicle.volume_unit === 'L' ? 'L' : 'gal'));
    setPricePerUnit(entry?.price_per_unit ?? 0);
    setTotalCost(entry?.total_cost ?? 0);
    setInferredField(null);
    setIsFullTank(entry ? Boolean(entry.is_full_tank) : true);
    setStation(entry?.station ?? '');
    setNotes(entry?.notes ?? '');
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
  }, [visible, entry, vehicle.distance_unit, vehicle.volume_unit]);

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
    });
    return () => {
      active = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    setGroupId(group?.id ?? null);
  }, [visible, group?.id, date]);

  useEffect(() => {
    if (!visible || entry) return;
    const fuelSetting = settings.find((item) => item.setting_key === 'fuel');
    const fallbackCategory =
      categories.find((category) =>
        /gas|fuel|combustible/i.test(category.category_name)
      ) ?? categories[0];
    setCategoryId(
      (current) =>
        current ?? fuelSetting?.category_id ?? fallbackCategory?.id ?? null
    );
    setPaymentMethodId(
      (current) =>
        current ?? fuelSetting?.payment_method_id ?? paymentMethods[0]?.id ?? null
    );
  }, [visible, settings, entry, categories, paymentMethods]);

  const volumeNumber = parseNumber(volume);
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


  const setVolumeAndRecalculate = (value: string) => {
    setVolume(value);
    const parsed = parseNumber(value);
    if (parsed <= 0) return;

    if (inferredField === 'price' && totalCost > 0) {
      setPricePerUnit(Math.round(totalCost / parsed));
      setInferredField('price');
    } else if (pricePerUnit > 0) {
      setTotalCost(Math.round(parsed * pricePerUnit));
      setInferredField('total');
    } else if (totalCost > 0) {
      setPricePerUnit(Math.round(totalCost / parsed));
      setInferredField('price');
    }
  };

  const setPriceAndRecalculate = (value: number) => {
    setPricePerUnit(value);
    if (value <= 0) return;

    if (inferredField === 'volume' && totalCost > 0) {
      setVolume((totalCost / value).toFixed(4));
      setInferredField('volume');
    } else if (volumeNumber > 0) {
      setTotalCost(Math.round(value * volumeNumber));
      setInferredField('total');
    } else if (totalCost > 0) {
      setVolume((totalCost / value).toFixed(4));
      setInferredField('volume');
    }
  };

  const setTotalAndRecalculate = (value: number) => {
    setTotalCost(value);
    if (value <= 0) return;

    if (inferredField === 'volume' && pricePerUnit > 0) {
      setVolume((value / pricePerUnit).toFixed(4));
      setInferredField('volume');
    } else if (inferredField === 'price' && volumeNumber > 0) {
      setPricePerUnit(Math.round(value / volumeNumber));
      setInferredField('price');
    } else if (volumeNumber > 0) {
      setPricePerUnit(Math.round(value / volumeNumber));
      setInferredField('price');
    } else if (pricePerUnit > 0) {
      setVolume((value / pricePerUnit).toFixed(4));
      setInferredField('volume');
    }
  };

  const selectLinkedRecord = (option: VehicleExpenseOption) => {
    setLinkedRecord(option);
    setDate(option.date);
    setTotalCost(option.amount);
    if (volumeNumber > 0) {
      setPricePerUnit(Math.round(option.amount / volumeNumber));
      setInferredField('price');
    } else if (pricePerUnit > 0) {
      setVolume((option.amount / pricePerUnit).toFixed(4));
      setInferredField('volume');
    } else {
      setInferredField('total');
    }
  };

  const save = async () => {
    if (!vehicle.id || volumeNumber <= 0 || totalCost <= 0 || pricePerUnit <= 0) {
      setError(t('vehicle.toast.empty'));
      return;
    }
    if (odometerMode === 'odometer' && !odometer.trim()) {
      setError(t('vehicle.toast.empty'));
      return;
    }
    if (linkMode === 'create' && !groupId) {
      setError(t('vehicle.records.groupRequired'));
      return;
    }
    if (linkMode === 'link' && !linkedRecord) {
      setError(t('vehicle.records.noResults'));
      return;
    }
    if (
      linkMode === 'link' &&
      linkedRecord &&
      totalCost !== linkedRecord.amount
    ) {
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
      await repository.saveFuelEntry({
        id: entry?.id,
        vehicle_id: vehicle.id,
        date,
        odometer: odometerMode === 'odometer' ? Number(odometer) : null,
        odometer_source: odometerMode === 'odometer' ? 'manual' : null,
        distance_unit: distanceUnit,
        distance_traveled: odometerMode === 'distance' ? Number(distance) : null,
        distance_source: odometerMode === 'distance' ? 'manual' : 'inferred',
        volume: volumeNumber,
        volume_unit: volumeUnit,
        price_per_unit: pricePerUnit,
        total_cost: totalCost,
        is_full_tank: isFullTank,
        station: station.trim() || null,
        notes: notes.trim() || null,
        finance: {
          linkMode,
          recordId: linkedRecord?.id,
          groupId,
          categoryId,
          paymentMethodId,
        },
      });
      showToast({ message: t('vehicle.toast.saved'), type: 'success' });
      onSaved();
      onClose();
    } catch (cause) {
      if (__DEV__) console.warn('[vehicle] fuel save failed', cause);
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
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!entry?.id) return;
    setSaving(true);
    try {
      await repository.deleteFuelEntry(entry.id, false);
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
        title={entry ? t('vehicle.fuel.editTitle') : t('vehicle.fuel.addTitle')}
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
          <DateField label={t('vehicle.fuel.date')} value={date} onChange={setDate} />
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
            label={t('vehicle.fuel.useOdometer')}
            value={odometerMode}
            options={[
              { label: t('vehicle.fuel.useOdometer'), value: 'odometer' },
              { label: t('vehicle.fuel.useDistance'), value: 'distance' },
            ]}
            onChange={setOdometerMode}
          />
          {odometerMode === 'odometer' ? (
            <TextField
              label={t('vehicle.fuel.odometer')}
              value={odometer}
              onChangeText={setOdometer}
              keyboardType='decimal-pad'
            />
          ) : (
            <TextField
              label={t('vehicle.fuel.distanceTraveled')}
              value={distance}
              onChangeText={setDistance}
              keyboardType='decimal-pad'
            />
          )}
          <SelectField
            label={t('vehicle.vehicle.volumeUnit')}
            value={volumeUnit}
            options={[
              { label: t('vehicle.vehicle.gallons'), value: 'gal' },
              { label: t('vehicle.vehicle.liters'), value: 'L' },
            ]}
            onChange={setVolumeUnit}
          />
          <TextField
            label={t('vehicle.fuel.volume')}
            value={volume}
            onChangeText={setVolumeAndRecalculate}
            keyboardType='decimal-pad'
          />
          <MoneyField
            label={t('vehicle.fuel.pricePerUnit')}
            value={pricePerUnit}
            onChangeCents={setPriceAndRecalculate}
          />
          <MoneyField
            label={t('vehicle.fuel.total')}
            value={totalCost}
            onChangeCents={setTotalAndRecalculate}
          />
          <SwitchField
            label={t('vehicle.fuel.fullTank')}
            value={isFullTank}
            onChange={setIsFullTank}
          />
          <TextField
            label={t('vehicle.fuel.station')}
            value={station}
            onChangeText={setStation}
          />
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
          <TextField
            label={t('vehicle.fuel.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
          {error ? <InlineMessage variant='error' message={error} /> : null}
        </View>
      </Modal>
      <VehicleExpensePicker
        visible={pickerVisible}
        date={date}
        amount={totalCost}
        onClose={() => setPickerVisible(false)}
        onSelect={selectLinkedRecord}
      />
      <ConfirmDialog
        visible={confirmDelete}
        title={t('vehicle.actions.delete')}
        message={t('vehicle.confirm.deleteFuel')}
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


