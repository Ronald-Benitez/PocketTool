import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';

export type FormFieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const FormField = ({
  label,
  required = false,
  hint,
  error,
  children,
  style,
}: FormFieldProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <AppText variant='label' color='muted'>
            {label}
          </AppText>
          {required ? (
            <AppText variant='label' color='danger' accessibilityLabel='required'>
              *
            </AppText>
          ) : null}
        </View>
      ) : null}
      {children}
      {error ? (
        <View style={styles.messageRow} accessibilityLiveRegion='polite'>
          <MaterialIcons name='error-outline' size={14} color={colors.danger} />
          <AppText variant='helper' color='danger'>
            {error}
          </AppText>
        </View>
      ) : hint ? (
        <AppText variant='helper' color='muted'>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    alignSelf: 'stretch',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xxs,
  },
});
