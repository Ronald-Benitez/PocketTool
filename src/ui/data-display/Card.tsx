import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { Surface, type SurfaceVariant } from '../primitives/Surface';

export type CardProps = Omit<ViewProps, 'style'> & {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  variant?: SurfaceVariant;
  style?: StyleProp<ViewStyle>;
};

export const Card = ({
  title,
  subtitle,
  footer,
  children,
  onPress,
  selected = false,
  disabled = false,
  variant = 'flat',
  style,
  ...rest
}: CardProps) => {
  const { colors } = useTheme();

  const content = (
    <Surface
      variant={variant}
      style={[
        selected
          ? { borderWidth: 2, borderColor: colors.primary }
          : null,
        disabled ? { opacity: 0.5 } : null,
        style,
      ]}
    >
      {title || subtitle ? (
        <View style={styles.header}>
          {title ? <AppText variant='subtitle'>{title}</AppText> : null}
          {subtitle ? (
            <AppText variant='caption' color='muted'>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Surface>
  );

  if (!onPress) {
    return <View {...rest}>{content}</View>;
  }

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole='button'
      accessibilityLabel={title}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: spacing.md,
  },
});
