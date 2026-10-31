import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  useCategories,
  usePaymentMethods,
  useVehicleExpenseLinksRepository,
  useVehicleFuelRepository,
  useVehicleSettingsRepository,
} from '@/src/db';
import type { VehicleFuelEntryView } from '@/src/db/repositories/vehicle';
import type { VehicleExpenseOption } from '@/src/db/repositories/vehicle';
import type { Vehicle, VehicleSetting } from '@/src/interfaces/schema';
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

export const FuelEntryForm = ({
  visible,
  vehicle,
  entry,
  onClose,
  onSaved,
}: FuelEntryFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useVehicleFuelRepository();
  const expenseRepository = useVehicleExpenseLinksRepository();
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
  const [isFullTank, setIsFullTank] = useState(true);
  const [station, setStation] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState<{ id?: number; category_name: string }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ id?: number; method_name: string }[]>([]);
  const [settings, setSettings] = useState<VehicleSetting[]>([]);
  const [groups, setGroups] = useState<{ id?: number; group_name: string }[]>([]);
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
    setIsFullTank(entry ? Boolean(entry.is_full_tank) : true);
    setStation(entry?.station ?? '');
    setNotes(entry?.notes ?? '');
    setLinkMode(entry?.record_id ? 'create' : 'create');
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
    let active = true;
    expenseRepository.listGroupsForDate(date).then((rows) => {
      if (!active) return;
      setGroups(rows);
      if (rows.length === 1) setGroupId(rows[0].id ?? null);
      else if (rows.length === 0) setGroupId(null);
    });
    return () => {
      active = false;
    };
  }, [visible, date]);

  useEffect(() => {
    if (!visible || entry) return;
    const fuelSetting = settings.find((item) => item.setting_key === 'fuel');
    setCategoryId((current) => current ?? fuelSetting?.category_id ?? null);
    setPaymentMethodId((current) => current ?? fuelSetting?.payment_method_id ?? null);
  }, [visible, settings, entry]);

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
  const groupOptions = groups.flatMap((group) =>
    group.id === undefined ? [] : [{ label: group.group_name, value: group.id }]
  );

  const setVolumeAndRecalculate = (value: string) => {
    setVolume(value);
    const parsed = parseNumber(value);
    if (parsed > 0 && pricePerUnit > 0) {
      setTotalCost(Math.round(parsed * pricePerUnit));
    } else if (parsed > 0 && totalCost > 0) {
      setPricePerUnit(Math.round(totalCost / parsed));
    }
  };

  const setPriceAndRecalculate = (value: number) => {
    setPricePerUnit(value);
    if (value > 0 && volumeNumber > 0) {
      setTotalCost(Math.round(value * volumeNumber));
    } else if (value > 0 && totalCost > 0) {
      setVolume((totalCost / value).toFixed(4));
    }
  };

  const setTotalAndRecalculate = (value: number) => {
    setTotalCost(value);
    if (value > 0 && volumeNumber > 0) {
      setPricePerUnit(Math.round(value / volumeNumber));
    } else if (value > 0 && pricePerUnit > 0) {
      setVolume((value / pricePerUnit).toFixed(4));
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
      setError(
        cause instanceof Error && cause.message === 'GROUP_REQUIRED'
          ? t('vehicle.records.groupRequired')
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
          {groups.length > 0 ? (
            <SelectField
              label={t('vehicle.records.group')}
              value={groupId}
              options={groupOptions}
              onChange={setGroupId}
            />
          ) : (
            <InlineMessage variant='warning' message={t('vehicle.records.groupRequired')} />
          )}
          <SelectField
            label={t('vehicle.records.create')}
            value={linkMode}
            options={[
              { label: t('vehicle.records.create'), value: 'create' },
              { label: t('vehicle.records.link'), value: 'link' },
              { label: t('vehicle.records.none'), value: 'none' },
            ]}
            onChange={setLinkMode}
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
        onSelect={setLinkedRecord}
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


