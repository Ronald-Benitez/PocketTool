import {
  summarizeFinancing,
  type FinancingAdjustmentInput,
  type FinancingPaymentInput,
  type FinancingSummaryInput,
} from './summary';

export type CardInstallmentInput = FinancingSummaryInput & {
  kind: string;
  status?: string | null;
  payment_method_id?: number | null;
  FinancingPayments?: FinancingPaymentInput[] | null;
  FinancingAdjustments?: FinancingAdjustmentInput[] | null;
};

/**
 * Returns the pending balance of active 0% installment purchases grouped by
 * credit card. These purchases reserve part of the card limit even when they
 * are not regular card statements.
 */
export const cardInstallmentUsage = (
  financings: CardInstallmentInput[]
): Map<number, number> => {
  const usage = new Map<number, number>();

  for (const financing of financings) {
    if (
      financing.kind !== 'installment_purchase' ||
      financing.status !== 'active' ||
      !financing.payment_method_id
    ) {
      continue;
    }

    const summary = summarizeFinancing(
      financing,
      financing.FinancingPayments ?? [],
      financing.FinancingAdjustments ?? []
    );
    if (summary.effectiveRateBps !== 0) continue;
    const cardId = financing.payment_method_id;
    usage.set(cardId, (usage.get(cardId) ?? 0) + summary.balanceCents);
  }

  return usage;
};
