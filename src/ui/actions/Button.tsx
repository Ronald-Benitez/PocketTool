import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { controlHeight, radii, spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const FONT_SIZE: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 16,
};

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  textStyle,
  onPress,
  ...rest
}: ButtonProps) => {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyles: Record<
    ButtonVariant,
    { backgroundColor: string; borderColor: string; textColor: string }
  > = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      textColor: colors.onPrimary,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
      textColor: colors.onSecondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      textColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: colors.primary,
    },
    danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      textColor: colors.onDanger,
    },
  };

  const palette = variantStyles[variant];

  return (
    <Pressable
      {...rest}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityRole='button'
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={{ color: colors.overlay }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: controlHeight[size],
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.textColor} />
      ) : (
        <>
          {leftIcon}
          <AppText
            variant='label'
            style={[
              {
                color: palette.textColor,
                fontSize: FONT_SIZE[size],
                fontWeight: '600',
              },
              textStyle,
            ]}
          >
            {label}
          </AppText>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
  },
});
