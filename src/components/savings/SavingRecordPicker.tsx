import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useSavings } from '@/src/db';
import type { SavingRecordOption } from '@/src/db/repositories/savings';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';

type SavingRecordPickerProps = {
  visible: boolean;
  date: number;
  amount?: number;
  onClose: () => void;
  onSelect: (option: SavingRecordOption) => void;
};

export const SavingRecordPicker = ({
  visible,
  date,
  amount,
  onClose,
  onSelect,
}: SavingRecordPickerProps) => {
  const { t } = useLanguage();
  const repository = useSavings();
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SavingRecordOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setLoading(true);
    const from = date - 1000 * 60 * 60 * 24 * 90;
    const to = date + 1000 * 60 * 60 * 24 * 90;
    repository
      .searchRecords({ from, to, search })
      .then((rows) => {
        if (active) setOptions(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visible, date, search]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('savings.records.title')}
      closeLabel={t('cancel')}
      scrollable
      footer={
        <View style={{ flex: 1 }}>
          <Button
            label={t('cancel')}
            variant='outline'
            onPress={onClose}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <Stack gap='md'>
        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder={t('savings.records.search')}
        />
        {loading ? (
          <LoadingState message={t('savings.records.title')} />
        ) : options.length === 0 ? (
          <EmptyState title={t('savings.records.empty')} />
        ) : (
          <View>
            {options.map((option, index) => (
              <ListItem
                key={option.id}
                title={option.name}
                subtitle={`${new Date(option.date).toLocaleDateString()} · ${
                  option.categoryName || t('savings.records.category')
                } · ${option.paymentMethodName}`}
                trailing={<FinanceValue cents={option.amount} size='sm' />}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                showDivider={index < options.length - 1}
              />
            ))}
          </View>
        )}
        <AppText variant='caption' color='muted'>
          {formatMoneyWithSymbol(amount ?? 0)}
        </AppText>
      </Stack>
    </Modal>
  );
};
