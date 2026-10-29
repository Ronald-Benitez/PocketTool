import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

import type { DataOrder, FilterField } from '@/src/domain/filters/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { IconButton } from '../actions/IconButton';
import { SelectField } from '../forms/SelectField';
import { Row } from '../primitives/Stack';
import { useTheme } from '../theme/ThemeProvider';

export type OrderRowProps = {
  fields: FilterField[];
  order: DataOrder;
  advanced: boolean;
  onChange: (order: DataOrder) => void;
  onRemove: () => void;
};

export const OrderRow = ({
  fields,
  order,
  advanced,
  onChange,
  onRemove,
}: OrderRowProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const availableFields = fields.filter(
    (field) => !field.advanced || advanced || field.column === order.column
  );
  const fieldOptions = availableFields.map((field) => ({
    label: field.label,
    value: field.column,
  }));
  const ascending = order.direction === 'ASC';

  return (
    <Row gap='sm' align='flex-end'>
      <SelectField<string>
        containerStyle={{ flex: 1 }}
        value={order.column}
        options={fieldOptions}
        onChange={(column) => onChange({ ...order, column })}
        title={t('recordsFilters.selectSortField')}
        placeholder={t('recordsFilters.selectSortField')}
        closeLabel={t('cancel')}
        searchable
        searchPlaceholder={t('recordsFilters.searchOptions')}
      />
      <IconButton
        label={t(ascending ? 'recordsFilters.ascending' : 'recordsFilters.descending')}
        size='sm'
        variant='surface'
        icon={
          <MaterialIcons
            name={ascending ? 'arrow-upward' : 'arrow-downward'}
            size={20}
            color={colors.text}
          />
        }
        onPress={() => onChange({ ...order, direction: ascending ? 'DESC' : 'ASC' })}
      />
      <IconButton
        label={t('recordsFilters.removeSort')}
        size='sm'
        variant='ghost'
        icon={<MaterialIcons name='delete-outline' size={20} color={colors.danger} />}
        onPress={onRemove}
      />
    </Row>
  );
};
