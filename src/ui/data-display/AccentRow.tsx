import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';

export type AccentRowProps = ViewProps & {
  accentColor?: string | null;
  bottomColor?: string | null;
  style?: StyleProp<ViewStyle>;
};

export const AccentRow = ({
  accentColor,
  bottomColor,
  style,
  children,
  ...rest
}: AccentRowProps) => {
  const { colors } = useTheme();

  return (
    <View
      {...rest}
      style={[
        styles.row,
        {
          backgroundColor: colors.surfaceMuted,
          borderLeftColor: accentColor || colors.border,
          borderBottomColor: bottomColor || colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
});
