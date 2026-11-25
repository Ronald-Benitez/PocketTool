import React, { useEffect } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/src/ui/theme/ThemeProvider';

import { useFeatures } from './store';

type FeatureProviderProps = {
  children: React.ReactNode;
};

export const FeatureProvider = ({ children }: FeatureProviderProps) => {
  const ready = useFeatures((state) => state.ready);
  const load = useFeatures((state) => state.load);
  const { colors } = useTheme();

  useEffect(() => {
    void load();
  }, [load]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return <>{children}</>;
};
