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
import { BottomSheet } from '../overlays/Modal';
import { FormField } from './FormField';
import { TextField } from './TextField';

export type SelectOption<T extends string | number = string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

export type SelectFieldProps<T extends string | number = string> = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  placeholder?: string;
  title?: string;
  emptyMessage?: string;
  closeLabel?: string;
  value: T | null | undefined;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  renderValue?: (option: SelectOption<T> | undefined) => React.ReactNode;
  renderOption?: (option: SelectOption<T>, selected: boolean) => React.ReactNode;
  renderTrigger?: (
    open: () => void,
    selected: SelectOption<T> | undefined
  ) => React.ReactNode;
  extra?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export const SelectField = <T extends string | number,>({
  label,
  required = false,
  hint,
  error,
  placeholder = 'Select an option',
  title,
  emptyMessage = 'No options available',
  closeLabel,
  value,
  options,
  onChange,
  disabled = false,
  containerStyle,
  renderValue,
  renderOption,
  renderTrigger,
  extra,
  searchable = false,
  searchPlaceholder = 'Search',
}: SelectFieldProps<T>) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.find((option) => option.value === value);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleOptions = searchable && normalizedSearch
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedSearch))
    : options;

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setVisible(false);
    setSearch('');
  };

  const open = () => {
    setSearch('');
    setVisible(true);
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
        onPress={disabled ? undefined : open}
        disabled={disabled}
        accessibilityRole='button'
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityState={{ disabled, expanded: visible }}
        style={
          renderTrigger
            ? { opacity: disabled ? 0.6 : 1 }
            : [
                styles.field,
                {
                  borderColor: error ? colors.danger : colors.border,
                  backgroundColor: colors.inputBackground,
                  opacity: disabled ? 0.6 : 1,
                },
              ]
        }
      >
        {renderTrigger ? (
          renderTrigger(open, selected)
        ) : (
          <>
            <View style={styles.value}>
              {renderValue ? (
                renderValue(selected)
              ) : (
                <AppText
                  color={selected ? 'default' : 'muted'}
                  numberOfLines={1}
                >
                  {selected?.label ?? placeholder}
                </AppText>
              )}
            </View>
            <MaterialIcons name='expand-more' size={22} color={colors.textMuted} />
          </>
        )}
      </Pressable>

      <BottomSheet
        visible={visible}
        onClose={() => {
          setVisible(false);
          setSearch('');
        }}
        title={title ?? label ?? placeholder}
        closeLabel={closeLabel}
        scrollable
      >
        {searchable ? (
          <TextField
            value={search}
            onChangeText={setSearch}
            placeholder={searchPlaceholder}
            autoCapitalize='none'
            autoCorrect={false}
            leftIcon={<MaterialIcons name='search' size={18} color={colors.textMuted} />}
          />
        ) : null}
        {extra ? <View style={{ paddingBottom: spacing.md }}>{extra}</View> : null}
        {visibleOptions.length === 0 ? (
          <AppText color='muted' align='center'>
            {emptyMessage}
          </AppText>
        ) : (
          <View style={styles.options}>
            {visibleOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => handleSelect(option)}
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
                      <AppText
                        color={isSelected ? 'primary' : 'default'}
                      >
                        {option.label}
                      </AppText>
                    )}
                  </View>
                  {isSelected ? (
                    <MaterialIcons name='check' size={20} color={colors.primary} />
                  ) : null}
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
});
