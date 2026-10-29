import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeProvider';
import { radii, spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { IconButton } from '../actions/IconButton';

export type InlineMessageVariant = 'info' | 'success' | 'warning' | 'error';

export type InlineMessageProps = {
  variant?: InlineMessageVariant;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS = {
  info: {
    background: 'toastInfoBg',
    text: 'toastInfoText',
    icon: 'info',
  },
  success: {
    background: 'toastSuccessBg',
    text: 'toastSuccessText',
    icon: 'check-circle',
  },
  warning: {
    background: 'toastWarningBg',
    text: 'toastWarningText',
    icon: 'warning',
  },
  error: {
    background: 'toastErrorBg',
    text: 'toastErrorText',
    icon: 'error',
  },
} as const;

export const InlineMessage = ({
  variant = 'info',
  title,
  message,
  children,
  onDismiss,
  dismissLabel = 'Dismiss',
  style,
}: InlineMessageProps) => {
  const { colors } = useTheme();
  const config = VARIANTS[variant];
  const textColor = colors[config.text];

  return (
    <View
      accessibilityLiveRegion={variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'}
      style={[
        styles.container,
        {
          backgroundColor: colors[config.background],
          borderColor: textColor,
        },
        style,
      ]}
    >
      <MaterialIcons name={config.icon} size={20} color={textColor} />
      <View style={styles.content}>
        {title ? (
          <AppText variant='label' style={{ color: textColor }}>
            {title}
          </AppText>
        ) : null}
        {message ? (
          <AppText variant='body' style={{ color: textColor }}>
            {message}
          </AppText>
        ) : null}
        {children}
      </View>
      {onDismiss ? (
        <IconButton
          label={dismissLabel}
          size='sm'
          variant='ghost'
          onPress={onDismiss}
          icon={<MaterialIcons name='close' size={18} color={textColor} />}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
});
