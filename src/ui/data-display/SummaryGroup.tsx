import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { Row, Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { FinanceValue } from './FinanceValue';

export type SummaryGroupItem = {
  key: string | number;
  label: string;
  cents: number;
  color?: string | null;
  onPress?: () => void;
};

export type SummaryGroupProps = {
  title: string;
  totalCents: number;
  items: SummaryGroupItem[];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const SummaryGroup = ({
  title,
  totalCents,
  items,
  onPress,
  style,
}: SummaryGroupProps) => {
  const { colors } = useTheme();

  return (
    <Surface variant='outlined' padding='md' style={style}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={title}
      >
        <Row
          justify='space-between'
          align='center'
          style={[styles.header, { borderBottomColor: colors.border }]}
        >
          <AppText variant='label' numberOfLines={2} style={{ flex: 1 }}>
            {title}
          </AppText>
          <FinanceValue cents={totalCents} size='md' color={colors.text} />
        </Row>
      </Pressable>

      {items.length > 0 ? (
        <Stack gap='xs' style={styles.items}>
          {items.map((item) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              disabled={!item.onPress}
              accessibilityRole={item.onPress ? 'button' : undefined}
              accessibilityLabel={item.label}
            >
              <Row justify='space-between' align='center' style={styles.itemRow}>
                <Row gap='sm' align='center' style={styles.itemLabel}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: item.color || colors.primary },
                    ]}
                  />
                  <AppText variant='body' numberOfLines={2} style={styles.itemText}>
                    {item.label}
                  </AppText>
                </Row>
                <FinanceValue cents={item.cents} size='md' color={colors.text} />
              </Row>
            </Pressable>
          ))}
        </Stack>
      ) : null}
    </Surface>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  items: {
    marginTop: spacing.sm,
  },
  itemRow: {
    minHeight: 36,
    gap: spacing.sm,
  },
  itemLabel: {
    flex: 1,
    minWidth: 0,
  },
  itemText: {
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
