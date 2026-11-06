import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  style,
}: EmptyStateProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon ?? (
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceMuted }]}>
          <MaterialIcons name='inbox' size={28} color={colors.textMuted} />
        </View>
      )}
      <AppText variant='subtitle' align='center'>
        {title}
      </AppText>
      {description ? (
        <AppText variant='body' color='muted' align='center'>
          {description}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    marginTop: spacing.sm,
  },
});
