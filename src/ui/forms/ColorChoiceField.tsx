import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { resolveVehicleColor } from '@/src/domain/vehicle/colors';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from '../primitives/AppText';
import { Row } from '../primitives/Stack';
import ColorPicker from './ColorPicker';
import { TextField } from './TextField';

const PALETTE = [
  '#DC2626',
  '#F97316',
  '#EAB308',
  '#16A34A',
  '#14B8A6',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#111827',
  '#F8FAFC',
  '#6B7280',
  '#D4AF37',
];

type ColorChoiceFieldProps = {
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  palette?: string[];
};

export const ColorChoiceField = ({
  label,
  hint,
  placeholder,
  value,
  onChange,
  palette = PALETTE,
}: ColorChoiceFieldProps) => {
  const { colors } = useTheme();
  const resolved = resolveVehicleColor(value);

  return (
    <View style={styles.container}>
      <TextField
        label={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        hint={hint}
        autoCapitalize='none'
      />
      <Row gap='xs' wrap>
        {palette.map((color) => {
          const selected = resolved.toUpperCase() === color.toUpperCase();
          return (
            <Pressable
              key={color}
              accessibilityRole='button'
              accessibilityLabel={color}
              onPress={() => onChange(color)}
              style={[
                styles.swatch,
                {
                  backgroundColor: color,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 3 : 1,
                },
              ]}
            />
          );
        })}
      </Row>
      <Row gap='sm' align='center'>
        <ColorPicker color={resolved} onChange={onChange} />
        <View style={styles.textBlock}>
          <AppText variant='body'>{resolved}</AppText>
          {hint ? (
            <AppText variant='caption' color='muted'>
              {hint}
            </AppText>
          ) : null}
        </View>
      </Row>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  textBlock: { flex: 1, gap: 2 },
});
