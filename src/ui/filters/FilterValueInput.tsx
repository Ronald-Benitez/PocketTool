import React from 'react';
import { View } from 'react-native';

import type { SqlOperator } from '@/src/orm';
import type { FilterField } from '@/src/domain/filters/types';
import { splitFilterValues } from '@/src/domain/filters/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { DateField } from '../forms/DateField';
import { MoneyField } from '../forms/MoneyField';
import { MultiSelectField } from '../forms/MultiSelectField';
import { SelectField } from '../forms/SelectField';
import { TextField } from '../forms/TextField';
import { Row } from '../primitives/Stack';

export type FilterValueInputProps = {
  field: FilterField;
  operator: SqlOperator;
  value: string;
  onChange: (value: string) => void;
};

const joinBetween = (from: string, to: string) => {
  if (from === '' && to === '') return '';
  return `${from},${to}`;
};

export const FilterValueInput = ({
  field,
  operator,
  value,
  onChange,
}: FilterValueInputProps) => {
  const { t } = useLanguage();
  const values = splitFilterValues(value);
  const options = (field.options ?? []).map((option) => ({
    label: option.label,
    value: String(option.value),
  }));
  const commonSelectProps = {
    title: t('recordsFilters.selectValue'),
    placeholder: t('recordsFilters.value'),
    closeLabel: t('cancel'),
    searchable: field.searchable,
    searchPlaceholder: t('recordsFilters.searchOptions'),
    emptyMessage: t('recordsFilters.noOptions'),
  };

  if (operator === 'IS' || operator === 'IS NOT') {
    const isBoolean = field.kind === 'boolean';
    const isNullOptions = [
      ...(isBoolean
        ? [
          { label: t('recordsFilters.true'), value: 'true' },
          { label: t('recordsFilters.false'), value: 'false' },
        ]
        : []),
      { label: t('recordsFilters.null'), value: 'null' },
    ];

    return (
      <SelectField<string>
        {...commonSelectProps}
        value={value || undefined}
        options={isNullOptions}
        onChange={onChange}
      />
    );
  }

  if (operator === 'BETWEEN') {
    const [from = '', to = ''] = value.split(',');

    if (field.kind === 'date') {
      return (
        <Row gap='sm' align='flex-start'>
          <View style={{ flex: 1 }}>
            <DateField
              label={t('recordsFilters.from')}
              value={from ? Number(from) : null}
              onChange={(timestamp) => onChange(joinBetween(String(timestamp), to))}
            />
          </View>
          <View style={{ flex: 1 }}>
            <DateField
              label={t('recordsFilters.to')}
              value={to ? Number(to) : null}
              onChange={(timestamp) => onChange(joinBetween(from, String(timestamp)))}
            />
          </View>
        </Row>
      );
    }

    if (field.kind === 'money') {
      return (
        <Row gap='sm' align='flex-start'>
          <View style={{ flex: 1 }}>
            <MoneyField
              label={t('recordsFilters.from')}
              value={from ? Number(from) : 0}
              onChangeCents={(cents) => onChange(joinBetween(String(cents), to))}
            />
          </View>
          <View style={{ flex: 1 }}>
            <MoneyField
              label={t('recordsFilters.to')}
              value={to ? Number(to) : 0}
              onChangeCents={(cents) => onChange(joinBetween(from, String(cents)))}
            />
          </View>
        </Row>
      );
    }

    return (
      <Row gap='sm' align='flex-end'>
        <View style={{ flex: 1 }}>
          <TextField
            label={t('recordsFilters.from')}
            value={from}
            onChangeText={(next) => onChange(joinBetween(next, to))}
            keyboardType='numeric'
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label={t('recordsFilters.to')}
            value={to}
            onChangeText={(next) => onChange(joinBetween(from, next))}
            keyboardType='numeric'
          />
        </View>
      </Row>
    );
  }

  if (operator === 'IN' && (field.kind === 'relation' || field.kind === 'enum')) {
    return (
      <MultiSelectField<string>
        {...commonSelectProps}
        values={values}
        options={options}
        onChange={(next) => onChange(next.join(','))}
        doneLabel={t('confirm')}
      />
    );
  }

  if (field.kind === 'relation' || field.kind === 'enum' || field.kind === 'boolean') {
    return (
      <SelectField<string>
        {...commonSelectProps}
        value={value || undefined}
        options={
          field.kind === 'boolean'
            ? [
              { label: t('recordsFilters.true'), value: 'true' },
              { label: t('recordsFilters.false'), value: 'false' },
            ]
            : options
        }
        onChange={onChange}
      />
    );
  }

  if (field.kind === 'date') {
    return (
      <DateField
        label={t('recordsFilters.value')}
        value={value ? Number(value) : null}
        onChange={(timestamp) => onChange(String(timestamp))}
      />
    );
  }

  if (field.kind === 'money') {
    return (
      <MoneyField
        label={t('recordsFilters.value')}
        value={value ? Number(value) : 0}
        onChangeCents={(cents) => onChange(String(cents))}
      />
    );
  }

  return (
    <TextField
      label={t('recordsFilters.value')}
      value={value}
      onChangeText={onChange}
      keyboardType={field.kind === 'number' ? 'numeric' : 'default'}
      placeholder={
        operator === 'IN'
          ? t('recordsFilters.commaSeparatedValues')
          : t('recordsFilters.value')
      }
      autoCapitalize='none'
    />
  );
};
