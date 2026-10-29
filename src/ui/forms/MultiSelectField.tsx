import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeProvider';
import { controlHeight, radii, spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { Button } from '../actions/Button';
import { BottomSheet } from '../overlays/Modal';
import { FormField } from './FormField';
import type { SelectOption } from './SelectField';

export type MultiSelectFieldProps<T extends string | number = string> = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  placeholder?: string;
  title?: string;
  emptyMessage?: string;
  closeLabel?: string;
  doneLabel?: string;
  values: T[];
  options: SelectOption<T>[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  renderValue?: (selected: SelectOption<T>[]) => React.ReactNode;
  renderOption?: (option: SelectOption<T>, selected: boolean) => React.ReactNode;
};

export const MultiSelectField = <T extends string | number,>({
  label,
  required = false,
  hint,
  error,
  placeholder = 'Select options',
  title,
  emptyMessage = 'No options available',
  closeLabel,
  doneLabel = 'Done',
  values,
  options,
  onChange,
  disabled = false,
  containerStyle,
  renderValue,
  renderOption,
}: MultiSelectFieldProps<T>) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const selectedOptions = options.filter((option) => values.includes(option.value));

  const toggle = (option: SelectOption<T>) => {
    if (option.disabled) return;
    if (values.includes(option.value)) {
      onChange(values.filter((value) => value !== option.value));
    } else {
      onChange([...values, option.value]);
    }
  };

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      style={containerStyle}
    >
      <Pressable
        onPress={disabled ? undefined : () => setVisible(true)}
        disabled={disabled}
        accessibilityRole='button'
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityState={{ disabled, expanded: visible }}
        style={[
          styles.field,
          {
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.inputBackground,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <View style={styles.value}>
          {renderValue ? (
            renderValue(selectedOptions)
          ) : (
            <AppText
              color={selectedOptions.length ? 'default' : 'muted'}
              numberOfLines={2}
            >
              {selectedOptions.length
                ? selectedOptions.map((option) => option.label).join(', ')
                : placeholder}
            </AppText>
          )}
        </View>
        <MaterialIcons name='expand-more' size={22} color={colors.textMuted} />
      </Pressable>

      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title={title ?? label ?? placeholder}
        closeLabel={closeLabel}
        scrollable
        footer={
          <View style={styles.footer}>
            <Button
              label={doneLabel}
              onPress={() => setVisible(false)}
              style={styles.doneButton}
            />
          </View>
        }
      >
        {options.length === 0 ? (
          <AppText color='muted' align='center'>
            {emptyMessage}
          </AppText>
        ) : (
          <View style={styles.options}>
            {options.map((option) => {
              const isSelected = values.includes(option.value);
              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => toggle(option)}
                  disabled={option.disabled}
                  accessibilityRole='button'
                  accessibilityState={{ selected: isSelected, disabled: option.disabled }}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? colors.chipBg : 'transparent',
                      borderColor: colors.border,
                      opacity: option.disabled ? 0.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.value}>
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <AppText color={isSelected ? 'primary' : 'default'}>
                        {option.label}
                      </AppText>
                    )}
                  </View>
                  <MaterialIcons
                    name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                    size={20}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
      </BottomSheet>
    </FormField>
  );
};

const styles = StyleSheet.create({
  field: {
    minHeight: controlHeight.md,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    flex: 1,
  },
  options: {
    gap: spacing.xs,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  doneButton: {
    minWidth: 120,
  },
});
