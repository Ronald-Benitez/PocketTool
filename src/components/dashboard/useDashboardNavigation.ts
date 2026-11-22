import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import type { DashboardBlockId } from '@/src/dashboard/types';
import {
  isDashboardTargetEnabled,
  resolveDashboardBlockTarget,
} from '@/src/dashboard/navigation';
import { useFeatures } from '@/src/features';
import type { FeatureId } from '@/src/features';

export const useDashboardNavigation = () => {
  const router = useRouter();
  const enabled = useFeatures((state) => state.enabled);

  const canUseFeature = useCallback(
    (feature: FeatureId | null) => !feature || Boolean(enabled[feature]),
    [enabled]
  );

  const openBlock = useCallback(
    (id: DashboardBlockId) => {
      const target = resolveDashboardBlockTarget(id);
      if (!target || !isDashboardTargetEnabled(target, enabled)) return false;
      router.push(target.href as never);
      return true;
    },
    [enabled, router]
  );

  return { enabled, canUseFeature, openBlock };
};
