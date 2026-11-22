import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { Row } from '../primitives/Stack';

export type ProgressTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'goal'
  | 'transfer';

export type ProgressBarProps = {
  /** Progress between 0 and 1. Values outside the range are clamped. */
  progress: number;
  label?: string;
  /** Replaces the default percentage label. */
  valueLabel?: string;
  tone?: ProgressTone;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export const ProgressBar = ({
  progress,
  label,
  valueLabel,
  tone = 'primary',
  size = 'md',
  style,
  accessibilityLabel,
}: ProgressBarProps) => {
  const { colors } = useTheme();
  const safeProgress = Number.isFinite(progress) ? progress : 0;
  const clamped = Math.max(0, Math.min(1, safeProgress));
  const percent = Math.round(clamped * 100);
  const height = size === 'sm' ? 6 : 8;

  const fillColor = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    goal: colors.goal,
    transfer: colors.transfer,
  }[tone];

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole='progressbar'
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      {label || valueLabel ? (
        <Row justify='space-between' align='center' gap='sm'>
          <AppText variant='caption' color='muted' numberOfLines={1} style={styles.label}>
            {label}
          </AppText>
          <AppText variant='caption' color='muted'>
            {valueLabel ?? `${percent}%`}
          </AppText>
        </Row>
      ) : null}
      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: radii.pill,
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={{
            width: `${percent}%`,
            height: '100%',
            borderRadius: radii.pill,
            backgroundColor: fillColor,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    alignSelf: 'stretch',
  },
  label: {
    flex: 1,
  },
  track: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
  },
});
