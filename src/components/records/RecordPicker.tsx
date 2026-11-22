import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { LoadingState } from '@/src/ui/feedback/LoadingState';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Stack } from '@/src/ui/primitives/Stack';

export type RecordPickerOption = {
  id: number;
  name: string;
  date: number;
  amount: number;
  categoryName?: string;
  paymentMethodName?: string;
  groupName?: string;
};

export type RecordPickerProps<T extends RecordPickerOption> = {
  visible: boolean;
  title: string;
  searchPlaceholder: string;
  emptyLabel: string;
  onClose: () => void;
  onSelect: (option: T) => void;
  fetcher: (search: string) => Promise<T[]>;
  footerLabel?: string;
};

/**
 * Shared record selector used when an operation links an existing record.
 * The caller owns the amount/date/group filters and the exclusion of records
 * already linked to another aggregate.
 */
export const RecordPicker = <T extends RecordPickerOption>({
  visible,
  title,
  searchPlaceholder,
  emptyLabel,
  onClose,
  onSelect,
  fetcher,
  footerLabel,
}: RecordPickerProps<T>) => {
  const { t } = useLanguage();
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSearch('');
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setLoading(true);
    fetcherRef
      .current(search)
      .then((rows) => {
        if (active) setOptions(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visible, search]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      closeLabel={t('cancel')}
      scrollable
    >
      <Stack gap='md'>
        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder={searchPlaceholder}
        />
        {loading ? (
          <LoadingState message={title} />
        ) : options.length === 0 ? (
          <EmptyState title={emptyLabel} />
        ) : (
          <View>
            {options.map((option, index) => {
              const meta = [
                new Date(option.date).toLocaleDateString(),
                option.categoryName,
                option.paymentMethodName,
                option.groupName,
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <ListItem
                  key={option.id}
                  title={option.name}
                  subtitle={meta}
                  trailing={<FinanceValue cents={option.amount} size='sm' />}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                  showDivider={index < options.length - 1}
                />
              );
            })}
          </View>
        )}
        {footerLabel ? (
          <AppText variant='caption' color='muted'>
            {footerLabel}
          </AppText>
        ) : null}
      </Stack>
    </Modal>
  );
};
