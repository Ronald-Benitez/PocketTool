import React from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import { SelectField, type SelectFieldProps } from './SelectField';

export type MonthFieldProps = Omit<
  SelectFieldProps<number>,
  'options' | 'onChange' | 'value'
> & {
  /** Mes 0-11. */
  value: number | null | undefined;
  onChange: (month: number) => void;
};

export const MonthField = ({ value, onChange, title, ...rest }: MonthFieldProps) => {
  const { t, getMonths } = useLanguage();
  const months = getMonths() as string[];

  return (
    <SelectField<number>
      {...rest}
      title={title ?? t('pickers.month')}
      value={value}
      onChange={onChange}
      options={months.map((label, index) => ({ label, value: index }))}
    />
  );
};
