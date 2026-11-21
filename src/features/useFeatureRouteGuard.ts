import { router, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useToast } from '@/src/ui/feedback/ToastProvider';

import { resolveRouteFeature } from './routes';
import { useFeatures } from './store';

export const useFeatureRouteGuard = () => {
  const segments = useSegments() as string[];
  const enabled = useFeatures((state) => state.enabled);
  const { t } = useLanguage();
  const { showToast } = useToast();
  const lastRedirect = useRef<string | null>(null);

  const routeKey = segments.join('/');
  const route = resolveRouteFeature(segments);
  const blocked = Boolean(route && !enabled[route.feature]);

  useEffect(() => {
    if (!blocked || !route) {
      lastRedirect.current = null;
      return;
    }

    const key = `${routeKey}:${route.feature}`;
    if (lastRedirect.current === key) return;
    lastRedirect.current = key;

    showToast({
      message: t('features.disabled.redirected'),
      type: 'info',
    });
    router.replace(route.redirect as never);
  }, [blocked, routeKey, route, showToast, t]);
};
