import { useCallback } from 'react';

import {
  useToast as useGlobalToast,
  type ToastVariant,
} from '@/src/ui/feedback/ToastProvider';

export interface ToastProps {
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
}

const TYPE_MAP: Record<ToastProps['type'], ToastVariant> = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Adaptador legacy sobre el `ToastProvider` global. `ToastContainer` se
 * mantiene como no-op para no romper las pantallas que todavía lo renderizan.
 */
const useToast = () => {
  const { showToast: showGlobalToast } = useGlobalToast();

  const showToast = useCallback(
    ({ message, type }: ToastProps) => {
      showGlobalToast({ message, type: TYPE_MAP[type] });
    },
    [showGlobalToast]
  );

  const ToastContainer = useCallback(() => null, []);

  return {
    showToast,
    ToastContainer,
  };
};

export default useToast;
