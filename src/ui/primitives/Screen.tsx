import React from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';

export type ScreenProps = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
};

export const Screen = ({
  scroll = false,
  padded = true,
  edges = ['left', 'right'],
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  style,
  children,
  ...rest
}: ScreenProps) => {
  const { colors } = useTheme();
  const paddingStyle = padded ? { padding: spacing.lg } : null;

  if (scroll) {
    return (
      <SafeAreaView
        edges={edges}
        style={[{ flex: 1, backgroundColor: colors.background }, style]}
        {...rest}
      >
        <ScrollView
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          contentContainerStyle={[paddingStyle, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={edges}
      style={[
        { flex: 1, backgroundColor: colors.background },
        paddingStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
};
