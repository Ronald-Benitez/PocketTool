import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '../primitives/AppText';
import { Row, Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import {
  FinanceValue,
  type FinanceTone,
} from './FinanceValue';
import { InfoHint, type InfoHintContent } from '../overlays/InfoHint';

export type StatTileProps = {
  label: string;
  /** Renders the value as money when defined. */
  cents?: number | null;
  /** Non-money value. Ignored when `cents` is defined. */
  value?: React.ReactNode;
  hint?: string;
  tone?: FinanceTone;
  valueColor?: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  accentColor?: string;
  tooltip?: InfoHintContent;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const StatTile = ({
  label,
  cents,
  value,
  hint,
  tone = 'auto',
  valueColor,
  size = 'md',
  icon,
  accentColor,
  tooltip,
  onPress,
  disabled = false,
  style,
  testID,
}: StatTileProps) => {
  const content = (
    <Surface
      variant='muted'
      padding='md'
      radius='lg'
      testID={testID}
      style={[disabled ? styles.disabled : null, style]}
    >
      <Stack gap='xs'>
        <Row justify='space-between' align='center' gap='sm'>
          <Row gap='xs' align='center' style={styles.labelRow}>
            {accentColor ? (
              <View style={[styles.accent, { backgroundColor: accentColor }]} />
            ) : null}
            {icon}
            <AppText
              variant='caption'
              color='muted'
              numberOfLines={1}
              style={styles.label}
            >
              {label}
            </AppText>
          </Row>
          {tooltip ? (
            <InfoHint title={tooltip.title} body={tooltip.body} />
          ) : null}
        </Row>
        {cents !== undefined && cents !== null ? (
          <FinanceValue
            cents={cents}
            tone={tone}
            size={size === 'sm' ? 'md' : 'lg'}
            color={valueColor}
          />
        ) : (
          <AppText
            variant={size === 'sm' ? 'body' : 'subtitle'}
            weight='600'
            numberOfLines={2}
            style={valueColor ? { color: valueColor } : undefined}
          >
            {value}
          </AppText>
        )}
        {hint ? (
          <AppText variant='caption' color='muted' numberOfLines={2}>
            {hint}
          </AppText>
        ) : null}
      </Stack>
    </Surface>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flex: 1,
  },
  label: {
    flex: 1,
  },
  accent: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});
