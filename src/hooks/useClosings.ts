import { useCallback, useEffect, useRef, useState } from 'react';

import {
  useGroupClosings,
  type ClosingInput,
  type ClosingSummary,
} from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import { useLanguage } from '@/src/lang/LanguageContext';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import type { GroupClosingView } from '@/src/interfaces/schema';

export const useClosings = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { group } = useRecordsStore();
  const repository = useGroupClosings();
  const repositoryRef = useRef(repository);
  repositoryRef.current = repository;
  const [closings, setClosings] = useState<ClosingSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const reportError = useCallback(
    (cause: unknown, fallback: string) => {
      if (__DEV__) console.warn('[closings] operation failed', cause);
      const code = cause instanceof Error ? cause.message : '';
      const known = code.startsWith('CLOSING_')
        ? (t(`closing.errors.${code}` as never) as string)
        : null;
      if (known && known !== `closing.errors.${code}`) {
        showToast({ message: known, type: 'error' });
        return;
      }
      const mapped = mapDatabaseError(cause, fallback);
      showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
    },
    [showToast, t]
  );

  const refresh = useCallback(
    async (groupId?: number | null) => {
      if (!groupId) {
        setClosings([]);
        return;
      }
      setLoading(true);
      try {
        const rows = await repositoryRef.current.fetchClosings(groupId);
        setClosings(rows);
      } catch (cause) {
        reportError(cause, t('toast.error'));
      } finally {
        setLoading(false);
      }
    },
    [reportError, t]
  );

  useEffect(() => {
    void refresh(group?.id);
  }, [group?.id, refresh]);

  const fetchClosing = useCallback(
    async (id: number): Promise<GroupClosingView | null> => {
      try {
        return await repositoryRef.current.fetchClosing(id);
      } catch (cause) {
        reportError(cause, t('toast.error'));
        return null;
      }
    },
    [reportError, t]
  );

  const createClosing = useCallback(
    async (input: ClosingInput) => {
      try {
        const id = await repositoryRef.current.createClosing(input);
        await refresh(input.group_id);
        showToast({ message: t('toast.added'), type: 'success' });
        return id;
      } catch (cause) {
        reportError(cause, t('toast.error'));
        return null;
      }
    },
    [refresh, reportError, t]
  );

  const updateClosing = useCallback(
    async (id: number, input: ClosingInput) => {
      try {
        await repositoryRef.current.updateClosing(id, input);
        await refresh(input.group_id);
        showToast({ message: t('toast.edited'), type: 'success' });
        return true;
      } catch (cause) {
        reportError(cause, t('toast.error'));
        return false;
      }
    },
    [refresh, reportError, t]
  );

  const deleteClosing = useCallback(
    async (id: number, groupId?: number | null) => {
      try {
        await repositoryRef.current.deleteClosing(id);
        await refresh(groupId);
        showToast({ message: t('toast.deleted'), type: 'success' });
        return true;
      } catch (cause) {
        reportError(cause, t('toast.error'));
        return false;
      }
    },
    [refresh, reportError, t]
  );

  const duplicateClosing = useCallback(
    async (id: number, groupId?: number | null) => {
      try {
        const newId = await repositoryRef.current.duplicateClosing(id);
        await refresh(groupId);
        showToast({ message: t('toast.added'), type: 'success' });
        return newId;
      } catch (cause) {
        reportError(cause, t('toast.error'));
        return null;
      }
    },
    [refresh, reportError, t]
  );

  return {
    closings,
    loading,
    refresh,
    fetchClosing,
    createClosing,
    updateClosing,
    deleteClosing,
    duplicateClosing,
  };
};

export default useClosings;
