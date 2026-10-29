import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

export type DividerProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
  inset?: number;
};

export const Divider = ({
  orientation = 'horizontal',
  inset = 0,
  style,
  ...rest
}: DividerProps) => {
  const { colors } = useTheme();

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.border,
          ...(orientation === 'horizontal'
            ? { height: 1, width: '100%', marginVertical: inset }
            : { width: 1, alignSelf: 'stretch', marginHorizontal: inset }),
        },
        style,
      ]}
    />
  );
};
