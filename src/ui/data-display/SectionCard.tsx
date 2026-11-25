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
import { spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { Divider } from '../primitives/Divider';
import { Row } from '../primitives/Stack';
import {
  Surface,
  type SurfaceRadius,
  type SurfaceVariant,
} from '../primitives/Surface';
import { InfoHint, type InfoHintContent } from '../overlays/InfoHint';

export type SectionCardProps = {
  title: string;
  /** Short context only. Move longer explanations to `tooltip`. */
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  tooltip?: InfoHintContent;
  children: React.ReactNode;
  footer?: React.ReactNode;
  collapsible?: boolean;
  /** Controlled collapsed state. When omitted, the card manages it internally. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  /** Set false for lists that manage their own row padding. */
  padded?: boolean;
  variant?: SurfaceVariant;
  radius?: SurfaceRadius;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Standard grouping container for screens and dashboard blocks.
 *
 * Keep one idea per card, one primary action in the header and no nested
 * SectionCards. Use the tooltip for optional explanation, never for errors.
 */
export const SectionCard = ({
  title,
  subtitle,
  icon,
  action,
  tooltip,
  children,
  footer,
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  onToggle,
  padded = true,
  variant = 'glass',
  radius = 'xl',
  style,
  contentStyle,
  testID,
}: SectionCardProps) => {
  const { colors } = useTheme();
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsed ?? internalCollapsed;

  const toggle = () => {
    if (!collapsible) return;
    const next = !isCollapsed;
    if (collapsed === undefined) setInternalCollapsed(next);
    onToggle?.(next);
  };

  const titleContent = (
    <>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.titleColumn}>
        <AppText variant='subtitle' numberOfLines={2}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant='caption' color='muted' numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {collapsible ? (
        <MaterialIcons
          name={isCollapsed ? 'expand-more' : 'expand-less'}
          size={22}
          color={colors.textMuted}
        />
      ) : null}
    </>
  );

  return (
    <Surface
      variant={variant}
      padding='none'
      radius={radius}
      style={style}
      testID={testID}
    >
      <View style={styles.header}>
        <Row justify='space-between' align='center' gap='sm'>
          {collapsible ? (
            <Pressable
              onPress={toggle}
              accessibilityRole='button'
              accessibilityState={{ expanded: !isCollapsed }}
              style={styles.titleArea}
            >
              {titleContent}
            </Pressable>
          ) : (
            <View style={styles.titleArea}>{titleContent}</View>
          )}
          {tooltip || action ? (
            <Row gap='xxs' align='center'>
              {tooltip ? (
                <InfoHint title={tooltip.title} body={tooltip.body} />
              ) : null}
              {action ? <View style={styles.actionSlot}>{action}</View> : null}
            </Row>
          ) : null}
        </Row>
      </View>

      {isCollapsed ? null : (
        <>
          <Divider />
          <View
            style={[
              padded ? styles.content : styles.contentFlush,
              contentStyle,
            ]}
          >
            {children}
          </View>
          {footer ? (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              {footer}
            </View>
          ) : null}
        </>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  titleArea: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    width: 28,
    alignItems: 'center',
  },
  actionSlot: {
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 1,
    gap: spacing.xxs,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  contentFlush: {
    padding: 0,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
});
