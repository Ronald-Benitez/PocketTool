import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { TextField } from '@/src/ui/forms/TextField';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { Modal } from '@/src/ui/overlays/Modal';

export type MaintenanceItemDraft = {
  name: string;
  notes?: string | null;
  quantity?: number | null;
  unit?: string | null;
  cost?: number | null;
};

type MaintenanceItemFormProps = {
  visible: boolean;
  item?: MaintenanceItemDraft | null;
  onClose: () => void;
  onSave: (item: MaintenanceItemDraft) => void;
};

export const MaintenanceItemForm = ({
  visible,
  item,
  onClose,
  onSave,
}: MaintenanceItemFormProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [cost, setCost] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(item?.name ?? '');
    setNotes(item?.notes ?? '');
    setQuantity(item?.quantity?.toString() ?? '');
    setUnit(item?.unit ?? '');
    setCost(item?.cost ?? 0);
    setError(null);
  }, [visible, item]);

  const save = () => {
    if (!name.trim()) {
      setError(t('vehicle.toast.empty'));
      return;
    }
    onSave({
      name: name.trim(),
      notes: notes.trim() || null,
      quantity: quantity.trim() ? Number(quantity) : null,
      unit: unit.trim() || null,
      cost: cost > 0 ? cost : null,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('vehicle.maintenance.addItem')}
      closeLabel={t('vehicle.actions.cancel')}
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label={t('vehicle.actions.cancel')}
            variant='outline'
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            label={t('vehicle.actions.save')}
            onPress={save}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <TextField
          label={t('vehicle.maintenance.itemName')}
          required
          value={name}
          onChangeText={setName}
        />
        <TextField
          label={t('vehicle.maintenance.itemNotes')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
        />
        <TextField
          label={t('vehicle.maintenance.quantity')}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType='decimal-pad'
        />
        <TextField
          label={t('vehicle.maintenance.unit')}
          value={unit}
          onChangeText={setUnit}
        />
        <MoneyField
          label={t('vehicle.maintenance.itemCost')}
          value={cost}
          onChangeCents={setCost}
        />
        {error ? <InlineMessage variant='error' message={error} /> : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: { gap: 16 },
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
