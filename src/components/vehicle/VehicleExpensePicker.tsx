import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useVehicleExpenseLinksRepository } from '@/src/db';
import type { VehicleExpenseOption } from '@/src/db/repositories/vehicle';
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

type VehicleExpensePickerProps = {
  visible: boolean;
  date: number;
  amount?: number;
  onClose: () => void;
  onSelect: (option: VehicleExpenseOption) => void;
};

export const VehicleExpensePicker = ({
  visible,
  date,
  amount,
  onClose,
  onSelect,
}: VehicleExpensePickerProps) => {
  const { t } = useLanguage();
  const repository = useVehicleExpenseLinksRepository();
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<VehicleExpenseOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setLoading(true);
    const from = date - 1000 * 60 * 60 * 24 * 90;
    const to = date + 1000 * 60 * 60 * 24 * 90;
    repository
      .searchRecords({
        from,
        to,
        search,
      })
      .then((rows) => {
        if (active) setOptions(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visible, date, amount, search]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('vehicle.records.title')}
      closeLabel={t('vehicle.actions.cancel')}
      scrollable
      footer={
        <View style={{ flex: 1 }}>
          <Button
            label={t('vehicle.actions.cancel')}
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
          placeholder={t('vehicle.records.searchPlaceholder')}
        />
        {loading ? (
          <LoadingState message={t('vehicle.records.title')} />
        ) : options.length === 0 ? (
          <EmptyState title={t('vehicle.records.noResults')} />
        ) : (
          <View>
            {options.map((option, index) => (
              <ListItem
                key={option.id}
                title={option.name}
                subtitle={`${new Date(option.date).toLocaleDateString()} · ${
                  option.categoryName || t('vehicle.records.category')
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

