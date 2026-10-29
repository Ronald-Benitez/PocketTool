import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, shadows, spacing } from '../theme/tokens';

export type SurfaceVariant = 'flat' | 'outlined' | 'muted' | 'raised';
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

export const Surface = ({
  variant = 'flat',
  padding = 'md',
  radius = 'md',
  style,
  ...rest
}: SurfaceProps) => {
  const { colors } = useTheme();

  const background =
    variant === 'muted'
      ? colors.surfaceMuted
      : variant === 'raised'
        ? colors.surfaceElevated
        : colors.surface;

  const baseStyle: ViewStyle = {
    backgroundColor: background,
    borderRadius: radii[radius],
    padding: PADDING[padding],
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: colors.border,
  };

  if (variant === 'raised') {
    Object.assign(baseStyle, shadows.card, { shadowColor: colors.shadow });
  }

  return <View {...rest} style={[baseStyle, style]} />;
};
