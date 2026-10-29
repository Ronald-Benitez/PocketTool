import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import type { ThemeColorTokens } from '@/src/interfaces/colors';
import { useTheme } from '../theme/ThemeProvider';
import { typography, type Typography } from '../theme/tokens';

const TEXT_COLORS = {
  default: 'text',
  muted: 'textMuted',
  disabled: 'textDisabled',
  inverse: 'textInverse',
  primary: 'primary',
  link: 'link',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
  info: 'info',
  income: 'income',
  expense: 'expense',
  onPrimary: 'onPrimary',
} satisfies Record<string, keyof ThemeColorTokens>;

export type TextColor = keyof typeof TEXT_COLORS;

export type AppTextProps = TextProps & {
  variant?: Typography;
  color?: TextColor;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
};

export const AppText = ({
  variant = 'body',
  color = 'default',
  align,
  weight,
  style,
  ...rest
}: AppTextProps) => {
  const { colors } = useTheme();

  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        { color: colors[TEXT_COLORS[color]] },
        align ? { textAlign: align } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    />
  );
};
