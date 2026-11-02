import { buildSchedule, sharedAmount } from './amortization';
import type { FinancingSchedule } from './types';

export type FinancingSummaryInput = {
  financed_cents: number;
  annual_rate_bps: number;
  term_months: number;
  first_payment_date?: number | null;
  paid_installments_before_app?: number | null;
  capital_paid_before_app_cents?: number | null;
  is_shared?: boolean | number | null;
  shared_percent?: number | null;
};

export type FinancingPaymentInput = {
  date?: number;
  extra_principal_cents?: number | null;
  extra_reduce_payment_cents?: number | null;
};

export type FinancingAdjustmentInput = {
  date: number;
  kind: string;
  new_annual_rate_bps?: number | null;
  new_term_months?: number | null;
  new_payment_cents?: number | null;
  capitalized_interest_cents?: number | null;
  fees_cents?: number | null;
};

export type FinancingSummaryOptions = {
  extraOnceCents?: number;
  extraOnceMode?: 'reduce_term' | 'reduce_payment';
  extraRecurringCents?: number;
  annualRateBps?: number;
  remainingTermMonths?: number;
};

export type FinancingSummary = {
  schedule: FinancingSchedule;
  balanceCents: number;
  monthlyPaymentCents: number;
  sharedPaymentCents: number;
  totalInterestCents: number;
  monthsRemaining: number;
  payoffDate: number | null;
  paidInstallments: number;
  extraCapitalCents: number;
  effectiveRateBps: number;
  remainingTermMonths: number;
  adjustment: FinancingAdjustmentInput | null;
};

const emptySchedule = (): FinancingSchedule => ({
  startingBalanceCents: 0,
  paymentCents: 0,
  rows: [],
  totalInterestCents: 0,
  totalPaidCents: 0,
  payoffDate: null,
});

const latestAdjustment = (
  adjustments: FinancingAdjustmentInput[]
): FinancingAdjustmentInput | null =>
  adjustments.reduce<FinancingAdjustmentInput | null>(
    (latest, adjustment) =>
      !latest || adjustment.date >= latest.date ? adjustment : latest,
    null
  );

export const summarizeFinancing = (
  financing: FinancingSummaryInput,
  payments: FinancingPaymentInput[],
  adjustments: FinancingAdjustmentInput[] = [],
  options: FinancingSummaryOptions = {}
): FinancingSummary => {
  const adjustment = latestAdjustment(adjustments);
  const paidInstallments =
    (financing.paid_installments_before_app ?? 0) + payments.length;
  const extraCapitalCents =
    (financing.capital_paid_before_app_cents ?? 0) +
    payments.reduce(
      (total, payment) =>
        total +
        (payment.extra_principal_cents ?? 0) +
        (payment.extra_reduce_payment_cents ?? 0),
      0
    );
  const originalTerm = Math.max(1, Math.round(financing.term_months));
  const originalRemaining = Math.max(0, originalTerm - paidInstallments);

  let adjustedRateBps = financing.annual_rate_bps;
  let adjustedTermMonths = originalRemaining;
  let adjustedPaymentCents: number | null = null;
  let capitalizedInterestCents = 0;
  const orderedAdjustments = [...adjustments].sort(
    (a, b) => a.date - b.date
  );
  for (const item of orderedAdjustments) {
    if (item.new_annual_rate_bps != null) {
      adjustedRateBps = item.new_annual_rate_bps;
    }
    if (item.new_term_months != null) {
      adjustedTermMonths = item.new_term_months;
    }
    if (item.new_payment_cents != null) {
      adjustedPaymentCents = item.new_payment_cents;
    }
    capitalizedInterestCents += item.capitalized_interest_cents ?? 0;
  }

  const remainingTermMonths = Math.max(
    0,
    Math.round(options.remainingTermMonths ?? adjustedTermMonths)
  );
  const effectiveRateBps = Math.max(
    0,
    Math.round(options.annualRateBps ?? adjustedRateBps)
  );

  const base = buildSchedule({
    principalCents: financing.financed_cents,
    annualRateBps: financing.annual_rate_bps,
    termMonths: originalTerm,
    firstPaymentDate: financing.first_payment_date,
    paidInstallments,
    capitalPaidCents: extraCapitalCents,
  });

  const extraOnceCents = Math.max(0, options.extraOnceCents ?? 0);
  const reducePayment = options.extraOnceMode === 'reduce_payment';
  const balanceCents = Math.max(
    0,
    base.startingBalanceCents +
      capitalizedInterestCents -
      (reducePayment ? extraOnceCents : 0)
  );

  if (balanceCents <= 0 || remainingTermMonths <= 0) {
    return {
      schedule: emptySchedule(),
      balanceCents: 0,
      monthlyPaymentCents: 0,
      sharedPaymentCents: 0,
      totalInterestCents: 0,
      monthsRemaining: 0,
      payoffDate: null,
      paidInstallments,
      extraCapitalCents,
      effectiveRateBps,
      remainingTermMonths: 0,
      adjustment,
    };
  }

  const schedule = buildSchedule({
    principalCents: balanceCents,
    annualRateBps: effectiveRateBps,
    termMonths: remainingTermMonths,
    firstPaymentDate: financing.first_payment_date,
    paidInstallments: 0,
    startIndex: paidInstallments,
    extraPrincipalCents: reducePayment ? 0 : extraOnceCents,
    extraRecurringCents: Math.max(0, options.extraRecurringCents ?? 0),
    paymentOverrideCents: adjustedPaymentCents,
  });

  return {
    schedule,
    balanceCents: schedule.startingBalanceCents,
    monthlyPaymentCents: schedule.paymentCents,
    sharedPaymentCents: financing.is_shared
      ? sharedAmount({
          amountCents: schedule.paymentCents,
          sharedPercent: financing.shared_percent,
        })
      : schedule.paymentCents,
    totalInterestCents: schedule.totalInterestCents,
    monthsRemaining: schedule.rows.length,
    payoffDate: schedule.payoffDate,
    paidInstallments,
    extraCapitalCents,
    effectiveRateBps,
    remainingTermMonths,
    adjustment,
  };
};
