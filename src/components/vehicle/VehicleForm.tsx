import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useVehiclesRepository } from '@/src/db';
import type { Vehicle } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { SelectField } from '@/src/ui/forms/SelectField';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { ConfirmDialog } from '@/src/ui/overlays/Dialog';
import { Modal } from '@/src/ui/overlays/Modal';

type VehicleFormProps = {
  visible: boolean;
  vehicle?: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
};

export const VehicleForm = ({ visible, vehicle, onClose, onSaved }: VehicleFormProps) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const repository = useVehiclesRepository();
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi');
  const [volumeUnit, setVolumeUnit] = useState<'gal' | 'L'>('gal');
  const [consumptionFormat, setConsumptionFormat] = useState<
    | 'mi_gal'
    | 'km_gal'
    | 'mi_l'
    | 'km_l'
    | 'l_100km'
    | 'gal_100km'
    | 'l_60mi'
    | 'gal_60mi'
  >('mi_gal');
  const [tankCapacity, setTankCapacity] = useState('');
  const [tankCapacityUnit, setTankCapacityUnit] = useState<'gal' | 'L'>('gal');
  const [isDefault, setIsDefault] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(vehicle?.name ?? '');
    setMake(vehicle?.make ?? '');
    setModel(vehicle?.model ?? '');
    setYear(vehicle?.year?.toString() ?? '');
    setPlate(vehicle?.plate ?? '');
    setColor(vehicle?.color ?? '');
    setDistanceUnit(vehicle?.distance_unit === 'km' ? 'km' : 'mi');
    setVolumeUnit(vehicle?.volume_unit === 'L' ? 'L' : 'gal');
    setConsumptionFormat(
      (vehicle?.consumption_format as typeof consumptionFormat) ?? 'mi_gal'
    );
    setTankCapacity(vehicle?.tank_capacity?.toString() ?? '');
    setTankCapacityUnit(vehicle?.tank_capacity_unit === 'L' ? 'L' : 'gal');
    setIsDefault(Boolean(vehicle?.is_default));
    setNotes(vehicle?.notes ?? '');
    setError(null);
  }, [visible, vehicle]);

  const save = async () => {
    if (!name.trim()) {
      setError(t('vehicle.toast.empty'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        make: make.trim() || null,
        model: model.trim() || null,
        year: year.trim() ? Number(year) : null,
        plate: plate.trim() || null,
        color: color.trim() || null,
        fuel_type: 'gasoline' as const,
        distance_unit: distanceUnit,
        volume_unit: volumeUnit,
        consumption_format: consumptionFormat,
        tank_capacity: tankCapacity.trim() ? Number(tankCapacity) : null,
        tank_capacity_unit: tankCapacity.trim() ? tankCapacityUnit : null,
        is_default: isDefault,
        notes: notes.trim() || null,
      };
      if (vehicle?.id) await repository.updateVehicle(vehicle.id, payload);
      else await repository.addVehicle(payload);
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
    if (!vehicle?.id) return;
    setSaving(true);
    try {
      await repository.deleteVehicle(vehicle.id);
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
        title={vehicle ? t('vehicle.actions.editVehicle') : t('vehicle.actions.addVehicle')}
        closeLabel={t('vehicle.actions.cancel')}
        scrollable
        footer={
          <View style={styles.footer}>
            {vehicle ? (
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
          <TextField
            label={t('vehicle.vehicle.name')}
            required
            value={name}
            onChangeText={setName}
            placeholder={t('vehicle.vehicle.namePlaceholder')}
          />
          <TextField label={t('vehicle.vehicle.make')} value={make} onChangeText={setMake} />
          <TextField label={t('vehicle.vehicle.model')} value={model} onChangeText={setModel} />
          <TextField
            label={t('vehicle.vehicle.year')}
            value={year}
            onChangeText={setYear}
            keyboardType='number-pad'
          />
          <TextField label={t('vehicle.vehicle.plate')} value={plate} onChangeText={setPlate} />
          <TextField label={t('vehicle.vehicle.color')} value={color} onChangeText={setColor} />
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
            label={t('vehicle.vehicle.volumeUnit')}
            value={volumeUnit}
            options={[
              { label: t('vehicle.vehicle.gallons'), value: 'gal' },
              { label: t('vehicle.vehicle.liters'), value: 'L' },
            ]}
            onChange={setVolumeUnit}
          />
          <SelectField
            label={t('vehicle.fuel.consumption')}
            value={consumptionFormat}
            options={[
              { label: t('vehicle.formats.mi_gal'), value: 'mi_gal' },
              { label: t('vehicle.formats.km_gal'), value: 'km_gal' },
              { label: t('vehicle.formats.mi_l'), value: 'mi_l' },
              { label: t('vehicle.formats.km_l'), value: 'km_l' },
              { label: t('vehicle.formats.l_100km'), value: 'l_100km' },
              { label: t('vehicle.formats.gal_100km'), value: 'gal_100km' },
              { label: t('vehicle.formats.l_60mi'), value: 'l_60mi' },
              { label: t('vehicle.formats.gal_60mi'), value: 'gal_60mi' },
            ]}
            onChange={setConsumptionFormat}
          />
          <TextField
            label={t('vehicle.vehicle.tankCapacity')}
            value={tankCapacity}
            onChangeText={setTankCapacity}
            keyboardType='decimal-pad'
          />
          <SelectField
            label={t('vehicle.vehicle.tankCapacityUnit')}
            value={tankCapacityUnit}
            options={[
              { label: t('vehicle.vehicle.gallons'), value: 'gal' },
              { label: t('vehicle.vehicle.liters'), value: 'L' },
            ]}
            onChange={setTankCapacityUnit}
          />
          <SwitchField
            label={t('vehicle.vehicle.isDefault')}
            value={isDefault}
            onChange={setIsDefault}
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
        title={t('vehicle.actions.deleteVehicle')}
        message={t('vehicle.confirm.deleteVehicle')}
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

