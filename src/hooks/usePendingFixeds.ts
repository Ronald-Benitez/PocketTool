import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useConfigs } from '@/src/hooks/useConfigs';
import { useDataStore } from '@/src/stores';
import useRecordsStore from '@/src/stores/RecordsStore';
import {
  useRecords,
  useSharedParticipantsRepository,
} from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { useLanguage } from '@/src/lang/LanguageContext';
import { computeParticipantShares } from '@/src/domain/shared/split';
import {
  isFixedPendingPaid,
  resolvePendingFixedDate,
  type FixedPendingRecordRef,
} from '@/src/domain/records/fixedPending';
import type { FixedView, SharedExpenseParticipant } from '@/src/interfaces/schema';

export type PendingFixed = {
  fixed: FixedView;
  date: number;
  ownCents: number;
  sharedCents: number;
};

type UsePendingFixedsOptions = {
  /** Limit the result to fixed transactions whose resolved date is today. */
  onlyDueToday?: boolean;
};

const isSameDay = (left: number, right: number) => {
  const a = new Date(left);
  const b = new Date(right);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

/**
 * Single source of truth for pending fixed transactions.
 *
 * Applies the configured date mode and deduplication mode, so Records and Home
 * always show the same pending items and proposed dates.
 */
export const usePendingFixeds = ({
  onlyDueToday = false,
}: UsePendingFixedsOptions = {}) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { Fixeds } = useDataStore();
  const { records, group } = useRecordsStore();
  const { configs } = useConfigs();
  const participantsRepository = useSharedParticipantsRepository();
  const recordsRepository = useRecords();
  const participantsRef = useRef(participantsRepository);
  const recordsRef = useRef(recordsRepository);
  participantsRef.current = participantsRepository;
  recordsRef.current = recordsRepository;
  const [participants, setParticipants] = useState<SharedExpenseParticipant[]>([]);
  const [fixedRecords, setFixedRecords] = useState<FixedPendingRecordRef[]>([]);

  const reportError = useCallback(
    (cause: unknown, label: string) => {
      if (__DEV__) console.warn(label, cause);
      const mapped = mapDatabaseError(cause, t('toast.error'));
      showToast({ message: t(`dbErrors.${mapped.code}` as never), type: 'error' });
    },
    [showToast, t]
  );

  useEffect(() => {
    let active = true;
    participantsRef.current
      .fetchAll('fixed')
      .then((rows) => {
        if (active) setParticipants(rows);
      })
      .catch((cause) => {
        if (!active) return;
        reportError(cause, '[pending fixeds] participants load failed');
      });
    return () => {
      active = false;
    };
  }, [Fixeds, reportError]);

  useEffect(() => {
    let active = true;

    if (configs.pendingFixedDedupeMode !== 'period') {
      setFixedRecords([]);
      return () => {
        active = false;
      };
    }

    const fixedIds = Fixeds.flatMap((fixed) =>
      typeof fixed.id === 'number' ? [fixed.id] : []
    );

    if (fixedIds.length === 0) {
      setFixedRecords([]);
      return () => {
        active = false;
      };
    }

    recordsRef.current.fetchFixedRecords(fixedIds)
      .then((rows) => {
        if (active) setFixedRecords(rows);
      })
      .catch((cause) => {
        if (!active) return;
        reportError(cause, '[pending fixeds] fixed records load failed');
      });

    return () => {
      active = false;
    };
  }, [Fixeds, configs.pendingFixedDedupeMode, records, reportError]);

  const pendingFixeds = useMemo(() => {
    const now = new Date().getTime();

    return Fixeds.flatMap<PendingFixed>((fixed) => {
      if (typeof fixed.id !== 'number') return [];

      const date = resolvePendingFixedDate({
        mode: configs.pendingFixedDateMode,
        now,
        fixedDay: fixed.fixed_day,
        groupYear: group?.year,
        groupMonth: group?.month,
      });

      const paid = isFixedPendingPaid({
        mode: configs.pendingFixedDedupeMode,
        fixedId: fixed.id,
        targetDate: date,
        groupId: group?.id ?? null,
        records:
          configs.pendingFixedDedupeMode === 'period' ? fixedRecords : records,
      });

      if (paid) return [];
      if (onlyDueToday && !isSameDay(date, now)) return [];

      const split = computeParticipantShares(
        fixed.fixed_amount,
        participants
          .filter((participant) => participant.owner_id === fixed.id)
          .map((participant) => ({
            personId: participant.person_id,
            shareMode: participant.share_mode as 'percent' | 'amount',
            sharePercent: participant.share_percent,
            shareAmountCents: participant.share_amount_cents ?? null,
          }))
      );

      return [
        {
          fixed,
          date,
          ownCents: split.ownCents,
          sharedCents: split.sharedCents,
        },
      ];
    }).sort((a, b) => a.date - b.date);
  }, [
    Fixeds,
    group?.id,
    group?.year,
    group?.month,
    records,
    fixedRecords,
    participants,
    configs.pendingFixedDateMode,
    configs.pendingFixedDedupeMode,
    onlyDueToday,
  ]);

  return { pendingFixeds };
};

export default usePendingFixeds;
