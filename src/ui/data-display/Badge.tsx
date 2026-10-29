import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Badge = ({
  label,
  tone = 'neutral',
  size = 'md',
  dot = false,
  style,
}: BadgeProps) => {
  const { colors } = useTheme();

  const palette = {
    neutral: { background: colors.chipBg, text: colors.chipText },
    primary: { background: colors.primary, text: colors.onPrimary },
    success: { background: colors.toastSuccessBg, text: colors.toastSuccessText },
    warning: { background: colors.toastWarningBg, text: colors.toastWarningText },
    danger: { background: colors.toastErrorBg, text: colors.toastErrorText },
    info: { background: colors.toastInfoBg, text: colors.toastInfoText },
  }[tone];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette.background,
          paddingVertical: size === 'sm' ? spacing.xxs : spacing.xs,
          paddingHorizontal: size === 'sm' ? spacing.xs : spacing.sm,
          gap: spacing.xs,
        },
        style,
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: palette.text }]} /> : null}
      <AppText
        variant={size === 'sm' ? 'helper' : 'caption'}
        style={{ color: palette.text, fontWeight: '600' }}
      >
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
