import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';

export type LinkButtonTone = 'primary' | 'link' | 'danger';

export type LinkButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  tone?: LinkButtonTone;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  underline?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const LinkButton = ({
  label,
  tone = 'primary',
  leftIcon,
  rightIcon,
  underline = false,
  disabled,
  style,
  textStyle,
  onPress,
  ...rest
}: LinkButtonProps) => {
  const { colors } = useTheme();
  const color =
    tone === 'danger' ? colors.danger : tone === 'link' ? colors.link : colors.primary;

  return (
    <Pressable
      {...rest}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole='link'
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {leftIcon}
      <AppText
        variant='label'
        style={[
          {
            color,
            textDecorationLine: underline ? 'underline' : 'none',
          },
          textStyle,
        ]}
      >
        {label}
      </AppText>
      {rightIcon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
});
