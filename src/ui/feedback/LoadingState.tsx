import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';

export type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const LoadingState = ({
  message,
  fullScreen = false,
  style,
}: LoadingStateProps) => {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole='progressbar'
      accessibilityLiveRegion='polite'
      style={[
        styles.container,
        fullScreen ? styles.fullScreen : null,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
        style,
      ]}
    >
      <ActivityIndicator color={colors.primary} size='large' />
      {message ? (
        <AppText variant='body' color='muted' align='center'>
          {message}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
  },
});
