import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { Row } from '@/src/ui/primitives/Stack';

type TermUnit = 'months' | 'years';

type TermFieldProps = {
  label: string;
  valueMonths: number;
  onChangeMonths: (months: number) => void;
  hint?: string;
};

const parseNumber = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
};

const formatMonths = (months: number, unit: TermUnit) => {
  if (unit === 'months') return String(Math.max(0, Math.round(months)));
  const years = Math.max(0, months) / 12;
  return Number.isInteger(years)
    ? String(years)
    : years.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
};

export const TermField = ({
  label,
  valueMonths,
  onChangeMonths,
  hint,
}: TermFieldProps) => {
  const { t } = useLanguage();
  const [unit, setUnit] = useState<TermUnit>('months');
  const [text, setText] = useState(() => formatMonths(valueMonths, 'months'));
  const lastMonths = useRef(valueMonths);
  const lastUnit = useRef<TermUnit>('months');

  useEffect(() => {
    if (lastMonths.current !== valueMonths) {
      lastMonths.current = valueMonths;
      setText(formatMonths(valueMonths, unit));
    } else if (lastUnit.current !== unit) {
      lastUnit.current = unit;
      setText(formatMonths(valueMonths, unit));
    }
  }, [valueMonths, unit]);

  const handleChange = (value: string) => {
    setText(value);
    const number = parseNumber(value);
    const months =
      unit === 'years' ? Math.round(number * 12) : Math.round(number);
    lastMonths.current = Math.max(0, months);
    onChangeMonths(Math.max(0, months));
  };

  const handleUnitChange = (nextUnit: TermUnit) => {
    setUnit(nextUnit);
    lastUnit.current = nextUnit;
    setText(formatMonths(valueMonths, nextUnit));
  };

  return (
    <Row gap='sm' align='flex-end'>
      <View style={{ flex: 1 }}>
        <TextField
          label={label}
          value={text}
          onChangeText={handleChange}
          keyboardType='decimal-pad'
          hint={hint}
        />
      </View>
      <SelectField
        label={t('financings.termUnit')}
        value={unit}
        options={[
          { label: t('financings.months'), value: 'months' },
          { label: t('financings.years'), value: 'years' },
        ]}
        onChange={handleUnitChange}
        containerStyle={{ width: 132 }}
      />
    </Row>
  );
};
