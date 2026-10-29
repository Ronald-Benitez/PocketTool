import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { AppText } from '../primitives/AppText';

export type ColoredSelectOptionProps = {
  color?: string | null;
  label: string;
};

/**
 * Fila de opción con borde izquierdo de color. Pensada para usarse con
 * `SelectField.renderOption` / `SelectField.renderValue`.
 */
export const ColoredSelectOption = ({ color, label }: ColoredSelectOptionProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.option,
        {
          borderLeftColor: color ?? colors.border,
          backgroundColor: colors.surfaceMuted,
        },
      ]}
    >
      <AppText numberOfLines={1}>{label}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  option: {
    flex: 1,
    borderLeftWidth: 3,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});
