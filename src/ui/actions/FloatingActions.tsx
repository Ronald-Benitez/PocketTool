import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useTheme } from '../theme/ThemeProvider';
import { radii, shadows, spacing, zIndex } from '../theme/tokens';
import { IconButton } from './IconButton';
import { QuickAction } from './QuickAction';

export type FloatingAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
};

export type FloatingActionsProps = {
  /** Main capture button. Tapping it runs this action directly. */
  mainAction: FloatingAction;
  /** Optional secondary actions shown by the toggle. */
  actions?: FloatingAction[];
  bottomOffset?: number;
  align?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Floating capture button with a secondary actions menu.
 *
 * The main action stays one tap away; the toggle expands up to three optional
 * actions. Place it inside a relative parent and keep it clear of the tab bar.
 */
export const FloatingActions = ({
  mainAction,
  actions = [],
  bottomOffset = spacing.xl,
  align = 'right',
  style,
  testID,
}: FloatingActionsProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const hasActions = actions.length > 0;

  return (
    <View
      pointerEvents='box-none'
      testID={testID}
      style={[
        styles.container,
        align === 'right' ? styles.right : styles.left,
        { bottom: bottomOffset },
        style,
      ]}
    >
      {expanded && hasActions ? (
        <View
          style={[
            styles.menu,
            { alignItems: align === 'right' ? 'flex-end' : 'flex-start' },
          ]}
        >
          {actions.map((action) => (
            <QuickAction
              key={action.id}
              label={action.label}
              icon={action.icon}
              layout='column'
              disabled={action.disabled}
              onPress={() => {
                setExpanded(false);
                action.onPress();
              }}
            />
          ))}
        </View>
      ) : null}

      {hasActions ? (
        <IconButton
          label={expanded ? t('collapseActions') : t('expandActions')}
          size='sm'
          variant='surface'
          icon={
            <MaterialIcons
              name={expanded ? 'close' : 'more-horiz'}
              size={22}
              color={colors.textMuted}
            />
          }
          onPress={() => setExpanded((current) => !current)}
          style={[styles.toggle, { shadowColor: colors.shadow }]}
        />
      ) : null}

      <Pressable
        onPress={mainAction.disabled ? undefined : mainAction.onPress}
        disabled={mainAction.disabled}
        accessibilityRole='button'
        accessibilityLabel={mainAction.label}
        accessibilityState={{ disabled: mainAction.disabled }}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.shadow,
            opacity: mainAction.disabled ? 0.45 : pressed ? 0.85 : 1,
          },
        ]}
      >
        {mainAction.icon ?? (
          <MaterialIcons name='add' size={28} color={colors.onPrimary} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: zIndex.dropdown,
    alignItems: 'center',
    gap: spacing.sm,
  },
  right: {
    right: spacing.lg,
  },
  left: {
    left: spacing.lg,
  },
  menu: {
    gap: spacing.sm,
  },
  toggle: {
    ...shadows.card,
    borderRadius: radii.pill,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
});
