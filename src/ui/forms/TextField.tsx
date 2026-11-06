import React, { forwardRef, useRef, useState } from 'react';
import {
  findNodeHandle,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { controlHeight, radii, spacing } from '../theme/tokens';
import { useModalScrollToInput } from '../overlays/ModalBodyContext';
import { FormField } from './FormField';

export type TextFieldSize = 'sm' | 'md' | 'lg';

export type TextFieldProps = TextInputProps & {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  size?: TextFieldSize;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export const TextField = forwardRef<React.ComponentRef<typeof TextInput>, TextFieldProps>(
  (
    {
      label,
      required = false,
      hint,
      error,
      size = 'md',
      disabled = false,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      style,
      editable,
      multiline = false,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
    const scrollToInput = useModalScrollToInput();

    const setInputRef = (node: React.ComponentRef<typeof TextInput> | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const borderColor = error
      ? colors.danger
      : focused
        ? colors.focusRing
        : colors.border;

    return (
      <FormField
        label={label}
        required={required}
        hint={hint}
        error={error}
        style={containerStyle}
      >
        <View
          style={[
            styles.wrapper,
            {
              borderColor,
              backgroundColor: colors.inputBackground,
              minHeight: controlHeight[size],
              opacity: disabled ? 0.6 : 1,
              alignItems: multiline ? 'flex-start' : 'center',
              paddingVertical: multiline ? spacing.sm : 0,
            },
          ]}
        >
          {leftIcon}
          <TextInput
            {...rest}
            ref={setInputRef}
            editable={editable ?? !disabled}
            multiline={multiline}
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.primary}
            accessibilityLabel={rest.accessibilityLabel ?? label}
            accessibilityHint={error ?? hint}
            onFocus={(event) => {
              setFocused(true);
              const node = inputRef.current;
              if (scrollToInput && node) {
                const handle = findNodeHandle(node);
                if (handle) scrollToInput(handle);
              }
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            style={[
              styles.input,
              {
                color: colors.text,
                height: multiline ? undefined : controlHeight[size] - 2,
                minHeight: multiline ? controlHeight.lg * 2 : undefined,
                textAlignVertical: multiline ? 'top' : 'center',
              },
              style,
              inputStyle,
            ]}
          />
          {rightIcon}
        </View>
      </FormField>
    );
  }
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
  },
});
