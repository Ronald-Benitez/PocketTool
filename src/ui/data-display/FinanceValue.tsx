import React from 'react';
import { type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from '../primitives/AppText';
import { formatMoney, formatMoneyWithSymbol } from '@/src/utils';

export type FinanceTone =
  | 'auto'
  | 'income'
  | 'expense'
  | 'neutral'
  | 'goal'
  | 'transfer';

export type FinanceValueSize = 'sm' | 'md' | 'lg' | 'xl';

export type FinanceValueProps = {
  /** Valor en centavos. */
  cents: number | null | undefined;
  tone?: FinanceTone;
  size?: FinanceValueSize;
  showSymbol?: boolean;
  signed?: boolean;
  style?: StyleProp<TextStyle>;
};

const VARIANT: Record<FinanceValueSize, 'caption' | 'body' | 'subtitle' | 'title'> = {
  sm: 'caption',
  md: 'body',
  lg: 'subtitle',
  xl: 'title',
};

export const FinanceValue = ({
  cents,
  tone = 'auto',
  size = 'md',
  showSymbol = true,
  signed = false,
  style,
}: FinanceValueProps) => {
  const { colors } = useTheme();
  const value = Number(cents ?? 0);

  const resolvedTone: Exclude<FinanceTone, 'auto'> =
    tone === 'auto'
      ? value > 0
        ? 'income'
        : value < 0
          ? 'expense'
          : 'neutral'
      : tone;

  const color = {
    income: colors.income,
    expense: colors.expense,
    neutral: colors.neutral,
    goal: colors.goal,
    transfer: colors.transfer,
  }[resolvedTone];

  const formatted = showSymbol ? formatMoneyWithSymbol(value) : formatMoney(value);
  const prefix = signed && value > 0 ? '+' : '';

  return (
    <AppText
      variant={VARIANT[size]}
      style={[{ color, fontWeight: '600' }, style]}
    >
      {prefix}
      {formatted}
    </AppText>
  );
};
