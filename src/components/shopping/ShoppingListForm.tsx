import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '@/src/ui/actions/Button';
import { InlineMessage } from '@/src/ui/feedback/InlineMessage';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { Stack } from '@/src/ui/primitives/Stack';

type Props = {
  visible: boolean;
  initialName?: string;
  isEditing?: boolean;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export const ShoppingListForm = ({
  visible,
  initialName = '',
  isEditing = false,
  busy = false,
  error,
  onClose,
  onSubmit,
}: Props) => {
  const { t } = useLanguage();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) setName(initialName);
  }, [visible, initialName]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={
        isEditing ? t('shopping.list.editTitle') : t('shopping.list.newTitle')
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
            onPress={() => onSubmit(name.trim())}
            loading={busy}
            disabled={!name.trim()}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Stack gap='md'>
        <TextField
          label={t('shopping.list.name')}
          placeholder={t('shopping.list.namePlaceholder')}
          value={name}
          onChangeText={setName}
          autoFocus
          required
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
