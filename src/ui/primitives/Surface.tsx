import React from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../theme/ThemeProvider';
import { withAlpha } from '../theme/color';
import { radii, shadows, spacing } from '../theme/tokens';

export type SurfaceVariant = 'flat' | 'outlined' | 'muted' | 'raised' | 'glass';
export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type SurfaceRadius = keyof typeof radii;

export type SurfaceProps = ViewProps & {
  variant?: SurfaceVariant;
  padding?: SurfacePadding;
  radius?: SurfaceRadius;
};

const PADDING: Record<SurfacePadding, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
};

const GLASS_ALPHA = {
  light: {
    background: 0.68,
    highlight: 0.12,
    border: 0.35,
  },
  dark: {
    background: 0.78,
    highlight: 0.08,
    border: 0.35,
  },
} as const;

export const Surface = ({
  variant = 'flat',
  padding = 'md',
  radius = 'md',
  style,
  children,
  ...rest
}: SurfaceProps) => {
  const { colors, resolvedMode } = useTheme();
  const isGlass = variant === 'glass';
  const glassAlpha = GLASS_ALPHA[resolvedMode];

  const background =
    variant === 'muted'
      ? colors.surfaceMuted
      : variant === 'raised'
        ? colors.surfaceElevated
        : colors.surface;

  const baseStyle: ViewStyle = {
    backgroundColor: isGlass
      ? withAlpha(colors.surface, glassAlpha.background)
      : background,
    borderRadius: radii[radius],
    padding: PADDING[padding],
    borderWidth: variant === 'outlined' || isGlass ? 1 : 0,
    borderColor: isGlass
      ? withAlpha(colors.borderStrong, glassAlpha.border)
      : colors.border,
  };

  if (variant === 'raised') {
    Object.assign(baseStyle, shadows.card, { shadowColor: colors.shadow });
  }

  if (isGlass) {
    Object.assign(baseStyle, shadows.glass, { shadowColor: colors.shadow });
    const highlight =
      resolvedMode === 'dark'
        ? withAlpha(colors.textInverse, glassAlpha.highlight)
        : withAlpha(colors.primary, glassAlpha.highlight);

    return (
      <View {...rest} style={[baseStyle, style]}>
        <LinearGradient
          pointerEvents='none'
          colors={[highlight, withAlpha(colors.textInverse, 0)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radii[radius] },
          ]}
        />
        {children}
      </View>
    );
  }

  return (
    <View {...rest} style={[baseStyle, style]}>
      {children}
    </View>
  );
};
