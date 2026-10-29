import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { FormField } from './FormField';

export type SwitchFieldProps = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onLabel?: string;
  offLabel?: string;
};

export const SwitchField = ({
  label,
  description,
  value,
  onChange,
  hint,
  error,
  disabled = false,
  required = false,
  onLabel,
  offLabel,
}: SwitchFieldProps) => {
  const { colors } = useTheme();
  const stateLabel = value ? onLabel : offLabel;

  return (
    <FormField label={label} required={required} hint={hint} error={error}>
      <View style={[styles.row, { opacity: disabled ? 0.6 : 1 }]}>
        <View style={styles.textBlock}>
          {description ? (
            <AppText variant='body' color='muted'>
              {description}
            </AppText>
          ) : null}
          {stateLabel ? (
            <AppText variant='caption' color='muted'>
              {stateLabel}
            </AppText>
          ) : null}
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          accessibilityLabel={label}
          accessibilityState={{ checked: value, disabled }}
          trackColor={{ false: colors.switchOff, true: colors.switchOn }}
          thumbColor={value ? colors.onPrimary : colors.surface}
          ios_backgroundColor={colors.switchOff}
        />
      </View>
    </FormField>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
});
