import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { MoneyField } from '@/src/ui/forms/MoneyField';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { Stack } from '@/src/ui/primitives/Stack';

export type ShoppingItemDraft = {
  item_name: string;
  price_cents: number | null;
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

  useEffect(() => {
    if (!visible) return;
    setName(initial?.item_name ?? '');
    setPrice(initial?.price_cents ?? 0);
  }, [visible, initial?.item_name, initial?.price_cents]);

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
            onPress={() =>
              onSubmit({
                item_name: name.trim(),
                price_cents: price > 0 ? price : null,
              })
            }
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
        {error ? <InlineMessage variant='error' message={error} /> : null}
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
