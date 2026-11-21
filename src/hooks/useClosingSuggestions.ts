import { useCallback, useMemo } from 'react';

import { isCreditCardPaymentMethod } from '@/src/domain/credits/cards';
import { useFeature } from '@/src/features';
import { summarizeFinancing } from '@/src/domain/credits/summary';
import { suggestClosingLines } from '@/src/domain/closing/suggestions';
import type { ClosingSuggestionResult } from '@/src/domain/closing/types';
import { useFinancingsRepository } from '@/src/db';
import { mapDatabaseError } from '@/src/db/errors';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useCreditStore } from '@/src/stores/CreditsStore';
import useResumesStore from '@/src/stores/ResumesStore';
import useRecordsStore from '@/src/stores/RecordsStore';
import { usePendingFixeds } from '@/src/hooks/usePendingFixeds';
import { useToast } from '@/src/ui/feedback/ToastProvider';

export const useClosingSuggestions = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { records } = useRecordsStore();
  const {
    balance,
    totalBalance,
    cashBalance,
    paidBalanceCents,
    balanceByPaymentMethod,
    receivableCents,
  } = useResumesStore();
  const { credits } = useCreditStore();
  const { pendingFixeds } = usePendingFixeds();
  const showCredits = useFeature('credits');
  const showFixeds = useFeature('fixeds');
  const showFinancings = useFeature('financings');
  const financingsRepository = useFinancingsRepository();

  const conflictRecordIds = useMemo(
    () =>
      records.flatMap((record) =>
        record.id != null &&
        record.saving_id != null &&
        isCreditCardPaymentMethod(record.PaymentMethods)
          ? [record.id]
          : []
      ),
    [records]
  );

  const buildSuggestions = useCallback(async (options?: {
    includeReceivables?: boolean;
    balanceMode?: 'consumption' | 'total' | 'cash' | 'paid' | 'methods';
  }): Promise<ClosingSuggestionResult | null> => {
    try {
      const financings = await financingsRepository.fetchFinancings();

      const cards = showCredits
        ? (credits ?? []).flatMap((credit) => {
            if (typeof credit.id !== 'number') return [];
            const expected = Math.max(
              0,
              (credit.totalPreviousCombined ?? credit.totalPrevious ?? 0) -
                (credit.totalCurrentPayments ?? 0)
            );
            return [
              {
                id: credit.id,
                name: credit.method_name,
                expectedCents: expected,
              },
            ];
          })
        : [];

      const fixeds = showFixeds
        ? pendingFixeds.flatMap((pending) =>
            typeof pending.fixed.id === 'number'
              ? [
                  {
                    id: pending.fixed.id,
                    name: pending.fixed.fixed_name,
                    amountCents: pending.ownCents,
                    date: pending.date,
                  },
                ]
              : []
          )
        : [];

      const financingPayments = showFinancings
        ? financings
            .filter((financing) => financing.status === 'active')
            .flatMap((financing) => {
              if (typeof financing.id !== 'number') return [];
              const summary = summarizeFinancing(
                financing,
                financing.FinancingPayments ?? [],
                financing.FinancingAdjustments ?? []
              );
              const next = summary.schedule.rows[0];
              if (!next) return [];
              const own = Math.max(
                0,
                summary.monthlyPaymentCents - summary.sharedPaymentCents
              );
              return [
                {
                  id: financing.id,
                  name: financing.name,
                  amountCents: own,
                  date: next.date,
                },
              ];
            })
        : [];

      const balanceMode = options?.balanceMode ?? 'consumption';
      const balanceCents =
        balanceMode === 'cash'
          ? cashBalance
          : balanceMode === 'paid'
            ? paidBalanceCents
            : balanceMode === 'total'
              ? totalBalance
              : balanceMode === 'methods'
                ? balanceByPaymentMethod.reduce(
                    (total, method) => total + method.balance,
                    0
                  )
                : balance;

      return suggestClosingLines({
        cashBalanceCents: balanceCents,
        receivableCents,
        includeReceivables: options?.includeReceivables ?? false,
        labels: {
          cash: t(
            `closing.suggestions.balance.${balanceMode}` as never
          ),
          receivable: t('closing.suggestions.receivable'),
        },
        savings: [],
        cards,
        fixeds,
        financings: financingPayments,
        conflictRecordIds,
      });
    } catch (cause) {
      if (__DEV__) console.warn('[closings] suggestions failed', cause);
      const mapped = mapDatabaseError(cause, t('toast.error'));
      showToast({
        message: t(`dbErrors.${mapped.code}` as never),
        type: 'error',
      });
      return null;
    }
  }, [
    balance,
    totalBalance,
    cashBalance,
    balanceByPaymentMethod,
    conflictRecordIds,
    credits,
    paidBalanceCents,
    pendingFixeds,
    receivableCents,
    showToast,
    showCredits,
    showFinancings,
    showFixeds,
    t,
  ]);

  return { buildSuggestions, conflictRecordIds };
};

export default useClosingSuggestions;
