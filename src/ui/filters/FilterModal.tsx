import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

import {
  getDefaultOperator,
  type DataFilter,
  type DataOrder,
  type FilterField,
} from '@/src/domain/filters/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Button } from '../actions/Button';
import { InlineMessage } from '../feedback/InlineMessage';
import { SwitchField } from '../forms/SwitchField';
import { Modal } from '../overlays/Modal';
import { AppText } from '../primitives/AppText';
import { Stack } from '../primitives/Stack';
import { useTheme } from '../theme/ThemeProvider';
import { FilterRow } from './FilterRow';
import { OrderRow } from './OrderRow';

export type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  fields: FilterField[];
  filters: DataFilter[];
  order: DataOrder[];
  onApply: (filters: DataFilter[], order: DataOrder[]) => void | Promise<void>;
  title?: string;
  storageKey?: string;
  allowOrder?: boolean;
};

const isFilterComplete = (filter: DataFilter) => {
  const value = filter.value.trim();
  if (!value) return true;
  if (filter.operator !== 'BETWEEN') return true;
  const parts = value.split(',');
  return parts.length === 2 && parts[0].trim() !== '' && parts[1].trim() !== '';
};

export const FilterModal = ({
  visible,
  onClose,
  fields,
  filters,
  order,
  onApply,
  title,
  storageKey,
  allowOrder = true,
}: FilterModalProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [draftFilters, setDraftFilters] = useState<DataFilter[]>([]);
  const [draftOrder, setDraftOrder] = useState<DataOrder[]>([]);
  const [advanced, setAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setDraftFilters(filters.map((filter) => ({ ...filter })));
    setDraftOrder(order.map((condition) => ({ ...condition })));
    setAdvanced(false);
    setError(null);
  }, [visible, filters, order]);

  const defaultField = fields.find((field) => !field.advanced) ?? fields[0];
  const hasIncompleteBetween = draftFilters.some((filter) => !isFilterComplete(filter));

  const updateFilter = (index: number, next: DataFilter) => {
    setDraftFilters((current) =>
      current.map((filter, itemIndex) => (itemIndex === index ? next : filter))
    );
  };

  const updateOrder = (index: number, next: DataOrder) => {
    setDraftOrder((current) =>
      current.map((condition, itemIndex) => (itemIndex === index ? next : condition))
    );
  };

  const addFilter = () => {
    if (!defaultField) return;
    setDraftFilters((current) => [
      ...current,
      {
        column: defaultField.column,
        operator: getDefaultOperator(defaultField.kind),
        value: '',
      },
    ]);
  };

  const addOrder = () => {
    if (!defaultField) return;
    setDraftOrder((current) => [
      ...current,
      { column: defaultField.column, direction: 'ASC' },
    ]);
  };

  const handleApply = async () => {
    setSaving(true);
    setError(null);
    try {
      if (storageKey) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(draftOrder));
      }
      await onApply(
        draftFilters.filter(
          (filter) => filter.value.trim().length > 0 && isFilterComplete(filter)
        ),
        draftOrder
      );
    } catch (applyError) {
      console.error('No se pudieron aplicar los filtros:', applyError);
      setError(t('toast.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title ?? t('recordsFilters.title')}
      closeLabel={t('cancel')}
      scrollable
      footer={
        <Stack direction='row' gap='sm' style={{ flex: 1 }}>
          <Button
            label={t('cancel')}
            variant='outline'
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <Button
            label={saving ? t('recordsFilters.saving') : t('confirm')}
            onPress={() => { void handleApply() }}
            disabled={saving || hasIncompleteBetween}
            loading={saving}
            style={{ flex: 1 }}
          />
        </Stack>
      }
    >
      <Stack gap='md'>
        <AppText variant='subtitle'>{t('recordsFilters.filters')}</AppText>

        {draftFilters.length === 0 ? (
          <AppText color='muted'>{t('recordsFilters.noFilters')}</AppText>
        ) : (
          draftFilters.map((filter, index) => (
            <FilterRow
              key={`filter-${index}`}
              fields={fields}
              filter={filter}
              advanced={advanced}
              onChange={(next) => updateFilter(index, next)}
              onRemove={() =>
                setDraftFilters((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index)
                )
              }
            />
          ))
        )}

        {hasIncompleteBetween ? (
          <InlineMessage
            variant='warning'
            message={t('recordsFilters.incompleteBetween')}
          />
        ) : null}

        {error ? <InlineMessage variant='error' message={error} /> : null}

        <Button
          label={t('recordsFilters.addFilter')}
          variant='ghost'
          onPress={addFilter}
          leftIcon={<MaterialIcons name='add' size={18} color={colors.primary} />}
          style={{ alignSelf: 'flex-start' }}
        />

        <SwitchField
          label={t('recordsFilters.advanced')}
          description={t('recordsFilters.advancedHint')}
          value={advanced}
          onChange={setAdvanced}
        />

        {allowOrder ? (
          <>
            <AppText variant='subtitle'>{t('recordsFilters.sortBy')}</AppText>
            {draftOrder.length === 0 ? (
              <AppText color='muted'>{t('recordsFilters.noFilters')}</AppText>
            ) : (
              draftOrder.map((condition, index) => (
                <OrderRow
                  key={`order-${index}`}
                  fields={fields}
                  order={condition}
                  advanced={advanced}
                  onChange={(next) => updateOrder(index, next)}
                  onRemove={() =>
                    setDraftOrder((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                />
              ))
            )}
            <Button
              label={t('recordsFilters.addSort')}
              variant='ghost'
              onPress={addOrder}
              leftIcon={<MaterialIcons name='add' size={18} color={colors.primary} />}
              style={{ alignSelf: 'flex-start' }}
            />
          </>
        ) : null}
      </Stack>
    </Modal>
  );
};
