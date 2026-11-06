import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { spacing } from '../theme/tokens';

export type StackProps = ViewProps & {
  direction?: 'row' | 'column';
  gap?: keyof typeof spacing;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  flex?: number;
};

export const Stack = ({
  direction = 'column',
  gap = 'md',
  align,
  justify,
  wrap = false,
  flex,
  style,
  ...rest
}: StackProps) => (
  <View
    {...rest}
    style={[
      {
        flexDirection: direction,
        gap: spacing[gap],
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: align,
        justifyContent: justify,
        flex,
      },
      style,
    ]}
  />
);

export const Row = (props: Omit<StackProps, 'direction'>) => (
  <Stack {...props} direction='row' />
);

export const Column = (props: Omit<StackProps, 'direction'>) => (
  <Stack {...props} direction='column' />
);
