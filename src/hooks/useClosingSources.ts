import { useEffect, useMemo, useRef, useState } from 'react';

import { isCreditCardPaymentMethod } from '@/src/domain/credits/cards';
import { summarizeFinancing } from '@/src/domain/credits/summary';
import type { ClosingKind, ClosingSection } from '@/src/domain/closing/types';
import { useFinancingsRepository } from '@/src/db';
import { useCreditStore } from '@/src/stores/CreditsStore';
import { useDataStore } from '@/src/stores';
import type { FinancingWithRelations } from '@/src/interfaces/schema';

export type ClosingSourceOption = {
  key: string;
  kind: ClosingKind;
  label: string;
  section: ClosingSection;
  amountCents: number;
  referenceCents?: number | null;
  paymentMethodId?: number | null;
  savingId?: number | null;
  fixedId?: number | null;
  financingId?: number | null;
};

/**
 * Catalog of registered app data that can be attached to a closing line.
 * Sources already used by another line are filtered by the editor.
 */
export const useClosingSources = () => {
  const { PaymentMethods, Fixeds } = useDataStore();
  const { credits } = useCreditStore();
  const financingsRepository = useFinancingsRepository();
  const financingsRef = useRef(financingsRepository);
  financingsRef.current = financingsRepository;
  const [financings, setFinancings] = useState<FinancingWithRelations[]>([]);

  useEffect(() => {
    let active = true;
    financingsRef.current
      .fetchFinancings()
      .then((financingRows) => {
        if (!active) return;
        setFinancings(financingRows);
      })
      .catch((cause) => {
        if (__DEV__) console.warn('[closing] source catalog failed', cause);
      });
    return () => {
      active = false;
    };
  }, []);

  const creditsById = useMemo(
    () =>
      new Map(
        (credits ?? []).flatMap((credit) =>
          credit.id === undefined ? [] : [[credit.id, credit] as const]
        )
      ),
    [credits]
  );

  const sources = useMemo<ClosingSourceOption[]>(() => {
    const options: ClosingSourceOption[] = [];

    PaymentMethods.forEach((method) => {
      if (method.id === undefined) return;
      if (isCreditCardPaymentMethod(method)) {
        const credit = creditsById.get(method.id);
        const expected = Math.max(
          0,
          (credit?.totalPreviousCombined ??
            credit?.totalPrevious ??
            0) - (credit?.totalCurrentPayments ?? 0)
        );
        options.push({
          key: `card:${method.id}`,
          kind: 'card',
          label: method.method_name,
          section: 'obligation',
          amountCents: expected,
          referenceCents: expected,
          paymentMethodId: method.id,
        });
        return;
      }
      options.push({
        key: `account:${method.id}`,
        kind: 'account',
        label: method.method_name,
        section: 'available',
        amountCents: 0,
        paymentMethodId: method.id,
      });
    });

    Fixeds.forEach((fixed) => {
      if (fixed.id === undefined) return;
      options.push({
        key: `fixed:${fixed.id}`,
        kind: 'fixed',
        label: fixed.fixed_name,
        section: 'obligation',
        amountCents: fixed.fixed_amount,
        fixedId: fixed.id,
      });
    });

    financings
      .filter((financing) => financing.status === 'active')
      .forEach((financing) => {
        if (financing.id === undefined) return;
        const summary = summarizeFinancing(
          financing,
          financing.FinancingPayments ?? [],
          financing.FinancingAdjustments ?? []
        );
        const own = Math.max(
          0,
          summary.monthlyPaymentCents - summary.sharedPaymentCents
        );
        options.push({
          key: `financing:${financing.id}`,
          kind: 'financing',
          label: financing.name,
          section: 'obligation',
          amountCents: own,
          financingId: financing.id,
        });
      });

    return options;
  }, [Fixeds, PaymentMethods, creditsById, financings]);

  return { sources };
};

export default useClosingSources;
