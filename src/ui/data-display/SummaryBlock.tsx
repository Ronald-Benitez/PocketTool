import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { spacing } from '../theme/tokens';
import { AppText, type TextColor } from '../primitives/AppText';
import { FinanceValue, type FinanceTone, type FinanceValueSize } from './FinanceValue';

export type SummaryBlockProps = {
  label: string;
  /** Si se define, renderiza el valor como dinero en centavos. */
  cents?: number | null;
  value?: React.ReactNode;
  tone?: FinanceTone;
  valueColor?: TextColor;
  valueColorOverride?: string;
  size?: FinanceValueSize;
  icon?: React.ReactNode;
  hint?: string;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<ViewStyle>;
};

export const SummaryBlock = ({
  label,
  cents,
  value,
  tone = 'auto',
  valueColor = 'default',
  valueColorOverride,
  size = 'md',
  icon,
  hint,
  align = 'left',
  style,
}: SummaryBlockProps) => {
  const alignment =
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

  return (
    <View style={[styles.container, { alignItems: alignment }, style]}>
      <View style={styles.labelRow}>
        {icon}
        <AppText variant='caption' color='muted'>
          {label}
        </AppText>
      </View>
      {cents !== undefined && cents !== null ? (
        <FinanceValue
          cents={cents}
          tone={tone}
          size={size}
          color={valueColorOverride}
        />
      ) : (
        <AppText
          variant={size === 'xl' ? 'title' : size === 'lg' ? 'subtitle' : 'body'}
          color={valueColor}
          weight='600'
          style={valueColorOverride ? { color: valueColorOverride } : undefined}
        >
          {value}
        </AppText>
      )}
      {hint ? (
        <AppText variant='helper' color='muted'>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
