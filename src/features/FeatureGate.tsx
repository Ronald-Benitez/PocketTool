import React from 'react';

import { useFeatures } from './store';
import type { FeatureId } from './types';

type FeatureGateProps = {
  feature: FeatureId;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export const FeatureGate = ({
  feature,
  fallback = null,
  children,
}: FeatureGateProps) => {
  const enabled = useFeatures((state) => state.enabled[feature]);
  return <>{enabled ? children : fallback}</>;
};

export const useFeature = (feature: FeatureId): boolean =>
  useFeatures((state) => state.enabled[feature]);
