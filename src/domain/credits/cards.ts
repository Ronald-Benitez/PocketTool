import {
  summarizeFinancing,
  type FinancingAdjustmentInput,
  type FinancingPaymentInput,
  type FinancingSummaryInput,
} from './summary';

export type PaymentMethodLike = {
  is_credit_card?: boolean | number | null;
  closing_date?: number | null;
  visual_kind?: string | null;
};

export const isCreditCardPaymentMethod = (
  method?: PaymentMethodLike | null
) =>
  Boolean(
    method &&
      (method.is_credit_card === true ||
        method.is_credit_card === 1 ||
        (method.closing_date ?? 0) > 0 ||
        method.visual_kind === 'credit_card')
  );

export const hasCreditCardSavingConflict = ({
  savingId,
  paymentMethod,
}: {
  savingId?: number | null;
  paymentMethod?: PaymentMethodLike | null;
}) => savingId != null && isCreditCardPaymentMethod(paymentMethod);

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
