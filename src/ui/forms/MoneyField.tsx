import React, { useEffect, useState } from 'react';
import type { TextInputProps } from 'react-native';

import { centsToInput, parseMoneyToCents } from '@/src/utils';
import { AppText } from '../primitives/AppText';
import { TextField, type TextFieldProps } from './TextField';

export type MoneyFieldProps = Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'keyboardType'
> & {
  /** Valor en centavos. */
  value: number;
  onChangeCents: (cents: number) => void;
  allowNegative?: boolean;
};

export const MoneyField = ({
  value,
  onChangeCents,
  allowNegative = false,
  leftIcon,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}: MoneyFieldProps) => {
  const [text, setText] = useState(() => centsToInput(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(centsToInput(value));
  }, [value, focused]);

  const handleChange = (next: string) => {
    const allowed = allowNegative ? /[^0-9.,-]/g : /[^0-9.,]/g;
    const sanitized = next.replace(allowed, '');
    setText(sanitized);
    onChangeCents(parseMoneyToCents(sanitized));
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (event) => {
    setFocused(false);
    setText(centsToInput(parseMoneyToCents(text)));
    onBlur?.(event);
  };

  return (
    <TextField
      {...rest}
      value={text}
      onChangeText={handleChange}
      keyboardType='decimal-pad'
      leftIcon={leftIcon ?? <AppText color='muted'>$</AppText>}
      inputStyle={[{ textAlign: 'right' }, inputStyle]}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={handleBlur}
    />
  );
};
