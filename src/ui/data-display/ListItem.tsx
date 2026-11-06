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

export type ListItemProps = {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  showDivider?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const ListItem = ({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  disabled = false,
  selected = false,
  showDivider = false,
  style,
}: ListItemProps) => {
  const { colors } = useTheme();

  const content = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.textBlock}>
        <AppText numberOfLines={1}>{title}</AppText>
        {subtitle ? (
          <AppText variant='caption' color='muted' numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  );

  const containerStyle = [
    styles.container,
    {
      backgroundColor: selected ? colors.surfaceMuted : 'transparent',
      borderBottomColor: colors.border,
      borderBottomWidth: showDivider ? 1 : 0,
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ];

  if (!onPress) {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole='button'
      accessibilityLabel={title}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        containerStyle,
        pressed ? { backgroundColor: colors.surfaceMuted } : null,
      ]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
