import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../theme/tokens';

export type IconButtonVariant = 'ghost' | 'surface' | 'primary';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: React.ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

const SIZE: Record<IconButtonSize, number> = {
  sm: 40,
  md: 48,
  lg: 56,
};

export const IconButton = ({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  selected = false,
  disabled,
  style,
  onPress,
  ...rest
}: IconButtonProps) => {
  const { colors } = useTheme();

  const background =
    variant === 'primary'
      ? colors.primary
      : variant === 'surface'
        ? colors.surface
        : selected
          ? colors.surfaceMuted
          : 'transparent';

  return (
    <Pressable
      {...rest}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      android_ripple={{ color: colors.overlay, borderless: true }}
      style={({ pressed }) => [
        styles.base,
        {
          width: SIZE[size],
          height: SIZE[size],
          backgroundColor: background,
          borderColor: variant === 'surface' ? colors.border : 'transparent',
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
  },
});
