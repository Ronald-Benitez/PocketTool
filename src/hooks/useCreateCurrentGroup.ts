import { useCallback } from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import { monthKey } from '@/src/lang/keys';
import useRecordsStore from '@/src/stores/RecordsStore';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useGroups } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { resolveGroupPeriodForDate } from '@/src/domain/groups/period';
import type { Group } from '@/src/interfaces/schema';

type CreateCurrentGroupOptions = {
  /** Automatic creation uses a different toast than the manual button. */
  automatic?: boolean;
};

/**
 * Creates the group for the period containing today when it does not exist.
 * Shared by the startup automation and the manual "create current group"
 * action in Settings.
 */
export const useCreateCurrentGroup = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const groupsRepository = useGroups();

  const createCurrentGroup = useCallback(
    async ({
      automatic = false,
    }: CreateCurrentGroupOptions = {}): Promise<Group | null> => {
      try {
        const configs = useConfigs.getState().configs;
        const now = Date.now();
        const target = resolveGroupPeriodForDate({
          mode: configs.groupPeriodMode,
          date: now,
          startDay: configs.groupStartDay,
        });
        if (!target) return null;

        const last = await groupsRepository.fetchLastGroup();
        const created = await groupsRepository.ensureCurrentGroup({
          mode: configs.groupPeriodMode,
          startDay: configs.groupStartDay,
          name: `${t(monthKey(target.month))} ${target.year}`,
          goal: last?.goal ?? 0,
          now,
        });

        if (!created) {
          if (!automatic) {
            showToast({
              message: t('group.currentExists'),
              type: 'info',
            });
          }
          return null;
        }

        const store = useRecordsStore.getState();
        const currentGroup = store.group;
        const activate = !automatic || !currentGroup?.id;
        if (activate) store.setGroup(created);
        const groups = await groupsRepository.fetchGroupsByYear(
          activate ? created.year : currentGroup!.year
        );
        store.setGroups(groups);
        showToast({
          message: t(
            automatic ? 'group.autoCreated' : 'group.createdNow',
            { name: created.group_name }
          ),
          type: 'success',
        });
        return created;
      } catch (cause) {
        if (__DEV__) console.warn('[groups] current group creation failed', cause);
        const mapped = mapDatabaseError(cause, t('toast.error'));
        showToast({
          message: t(`dbErrors.${mapped.code}` as never),
          type: 'error',
        });
        return null;
      }
    },
    [groupsRepository, showToast, t]
  );

  return { createCurrentGroup };
};

export default useCreateCurrentGroup;
