import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { resolveVehicleColor } from '@/src/domain/vehicle/colors';
import { useLanguage } from '@/src/lang/LanguageContext';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row } from '@/src/ui/primitives/Stack';
import ColorPicker from '@/src/ui/forms/ColorPicker';
import { TextField } from '@/src/ui/forms/TextField';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type VehicleColorFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

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

export const VehicleColorField = ({
  value,
  onChange,
}: VehicleColorFieldProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const resolved = resolveVehicleColor(value);

  return (
    <View style={styles.container}>
      <TextField
        label={t('vehicle.vehicle.color')}
        value={value}
        onChangeText={onChange}
        placeholder={t('vehicle.vehicle.colorPlaceholder')}
        hint={t('vehicle.vehicle.colorHint')}
        autoCapitalize='none'
      />
      <Row gap='xs' wrap>
        {PALETTE.map((color) => {
          const selected = resolved.toUpperCase() === color;
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
          <AppText variant='caption' color='muted'>
            {t('vehicle.vehicle.colorHint')}
          </AppText>
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
