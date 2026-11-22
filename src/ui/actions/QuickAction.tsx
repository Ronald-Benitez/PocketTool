import React from 'react';
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { controlHeight, radii, spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';

export type QuickActionTone = 'default' | 'primary' | 'danger';
export type QuickActionLayout = 'row' | 'column';

export type QuickActionProps = {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  tone?: QuickActionTone;
  layout?: QuickActionLayout;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const QuickAction = ({
  label,
  icon,
  onPress,
  disabled = false,
  tone = 'default',
  layout = 'row',
  style,
  testID,
}: QuickActionProps) => {
  const { colors } = useTheme();

  const palette = {
    default: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      textColor: 'default' as const,
    },
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      textColor: 'onPrimary' as const,
    },
    danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      textColor: 'inverse' as const,
    },
  }[tone];

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        layout === 'row' ? styles.row : styles.column,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {icon}
      <AppText
        variant='label'
        color={palette.textColor}
        numberOfLines={layout === 'row' ? 1 : 2}
        align={layout === 'column' ? 'center' : undefined}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: controlHeight.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  column: {
    gap: spacing.xs,
    width: 104,
    height: 84,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
});
