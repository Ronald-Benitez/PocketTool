import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import {
  formatQuantity,
  parseQuantityInput,
  SHOPPING_UNITS,
  type ShoppingUnit,
} from '@/src/domain/shopping/units';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { Row, Stack } from '@/src/ui/primitives/Stack';

export type ShoppingItemDraft = {
  item_name: string;
  price_cents: number | null;
  quantity: number | null;
  unit: string | null;
};

type Props = {
  visible: boolean;
  initial?: ShoppingItemDraft | null;
  isEditing?: boolean;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (draft: ShoppingItemDraft) => void;
};

export const ShoppingItemForm = ({
  visible,
  initial,
  isEditing = false,
  busy = false,
  error,
  onClose,
  onSubmit,
}: Props) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<ShoppingUnit>('unit');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(initial?.item_name ?? '');
    setPrice(initial?.price_cents ?? 0);
    setQuantity(
      initial?.quantity != null ? formatQuantity(initial.quantity) : ''
    );
    setUnit((initial?.unit as ShoppingUnit) ?? 'unit');
    setLocalError(null);
  }, [
    visible,
    initial?.item_name,
    initial?.price_cents,
    initial?.quantity,
    initial?.unit,
  ]);

  const submit = () => {
    const parsedQuantity = quantity.trim()
      ? parseQuantityInput(quantity)
      : null;
    if (quantity.trim() && parsedQuantity == null) {
      setLocalError(t('shopping.item.quantityInvalid'));
      return;
    }
    onSubmit({
      item_name: name.trim(),
      price_cents: price > 0 ? price : null,
      quantity: parsedQuantity,
      unit: parsedQuantity != null ? unit : null,
    });
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={
        isEditing ? t('shopping.item.editTitle') : t('shopping.item.newTitle')
      }
      closeLabel={t('cancel')}
      footer={
        <View style={styles.footer}>
          <Button
            label={t('cancel')}
            variant='outline'
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            label={t('save')}
            onPress={submit}
            loading={busy}
            disabled={!name.trim()}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Stack gap='md'>
        <TextField
          label={t('shopping.item.name')}
          placeholder={t('shopping.item.namePlaceholder')}
          value={name}
          onChangeText={setName}
          autoFocus
          required
        />
        <MoneyField
          label={t('shopping.item.price')}
          hint={t('shopping.item.priceHint')}
          value={price}
          onChangeCents={setPrice}
        />
        <Row gap='sm'>
          <TextField
            label={t('shopping.item.quantity')}
            hint={t('shopping.item.quantityHint')}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType='decimal-pad'
            containerStyle={styles.field}
          />
          <SelectField<ShoppingUnit>
            label={t('shopping.item.unit')}
            value={unit}
            options={SHOPPING_UNITS.map((code) => ({
              value: code,
              label: t(`shopping.item.units.${code}` as never),
            }))}
            onChange={setUnit}
            containerStyle={styles.field}
          />
        </Row>
        {localError ? (
          <InlineMessage variant='error' message={localError} />
        ) : null}
        {error ? <InlineMessage variant='error' message={error} /> : null}
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
  field: { flex: 1 },
});
