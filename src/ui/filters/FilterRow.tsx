import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { SqlOperator } from '@/src/orm';
import {
  getDefaultOperator,
  type DataFilter,
  type FilterField,
} from '@/src/domain/filters/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { IconButton } from '../actions/IconButton';
import { SelectField } from '../forms/SelectField';
import { AppText } from '../primitives/AppText';
import { Row, Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { useTheme } from '../theme/ThemeProvider';
import { FilterValueInput } from './FilterValueInput';

export type FilterRowProps = {
  fields: FilterField[];
  filter: DataFilter;
  advanced: boolean;
  onChange: (filter: DataFilter) => void;
  onRemove: () => void;
};

export const FilterRow = ({
  fields,
  filter,
  advanced,
  onChange,
  onRemove,
}: FilterRowProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const field = fields.find((item) => item.column === filter.column);
  const availableFields = fields.filter(
    (item) => !item.advanced || advanced || item.column === filter.column
  );

  const fieldOptions = availableFields.map((item) => ({
    label: item.label,
    value: item.column,
  }));
  const operatorOptions = (field?.operators ?? []).map((operator) => ({
    label: t(`recordsFilters.operators.${operator}`),
    value: operator,
  }));

  const changeField = (column: string) => {
    const nextField = fields.find((item) => item.column === column);
    if (!nextField) return;
    onChange({
      column: nextField.column,
      operator: getDefaultOperator(nextField.kind),
      value: '',
    });
  };

  const changeOperator = (operator: SqlOperator) => {
    onChange({ ...filter, operator, value: '' });
  };

  return (
    <Surface variant='outlined' padding='sm'>
      <Stack gap='sm'>
        <Row gap='sm' align='flex-end'>
          <SelectField<string>
            containerStyle={{ flex: 1 }}
            value={filter.column}
            options={fieldOptions}
            onChange={changeField}
            title={t('recordsFilters.selectFilterField')}
            placeholder={t('recordsFilters.selectFilterField')}
            closeLabel={t('cancel')}
            searchable
            searchPlaceholder={t('recordsFilters.searchOptions')}
          />
          <SelectField<SqlOperator>
            containerStyle={{ flex: 1 }}
            value={filter.operator}
            options={operatorOptions}
            onChange={changeOperator}
            title={t('recordsFilters.selectOperator')}
            placeholder={t('recordsFilters.selectOperator')}
            closeLabel={t('cancel')}
            searchable
            searchPlaceholder={t('recordsFilters.searchOptions')}
          />
          <IconButton
            label={t('recordsFilters.removeFilter')}
            size='sm'
            variant='ghost'
            icon={<MaterialIcons name='delete-outline' size={20} color={colors.danger} />}
            onPress={onRemove}
          />
        </Row>

        {field ? (
          <View>
            <AppText variant='caption' color='muted'>
              {field.label}
            </AppText>
            <FilterValueInput
              field={field}
              operator={filter.operator}
              value={filter.value}
              onChange={(value) => onChange({ ...filter, value })}
            />
          </View>
        ) : null}
      </Stack>
    </Surface>
  );
};
