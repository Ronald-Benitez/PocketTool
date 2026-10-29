import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import ColorPicker from './ColorPicker';
import { FormField } from './FormField';

export type ColorFieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
};

export const ColorField = ({
  label,
  required = false,
  hint,
  error,
  value,
  onChange,
  disabled = false,
}: ColorFieldProps) => {
  const { colors } = useTheme();

  return (
    <FormField label={label} required={required} hint={hint} error={error}>
      <View style={styles.row}>
        {disabled ? (
          <View
            style={[
              styles.swatch,
              { backgroundColor: value, borderColor: colors.border, opacity: 0.6 },
            ]}
          />
        ) : (
          <ColorPicker color={value} onChange={onChange} />
        )}
        <View style={styles.textBlock}>
          <AppText variant='body'>{value.toUpperCase()}</AppText>
          <AppText variant='caption' color='muted'>
            HEX
          </AppText>
        </View>
      </View>
    </FormField>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  swatch: {
    width: 50,
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
});
