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
  extra_principal_cents?: number | null;
  extra_reduce_payment_cents?: number | null;
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
};

export const summarizeFinancing = (
  financing: FinancingSummaryInput,
  payments: FinancingPaymentInput[]
): FinancingSummary => {
  const extraCapitalCents =
    (financing.capital_paid_before_app_cents ?? 0) +
    payments.reduce(
      (total, payment) =>
        total +
        (payment.extra_principal_cents ?? 0) +
        (payment.extra_reduce_payment_cents ?? 0),
      0
    );
  const paidInstallments =
    (financing.paid_installments_before_app ?? 0) + payments.length;
  const schedule = buildSchedule({
    principalCents: financing.financed_cents,
    annualRateBps: financing.annual_rate_bps,
    termMonths: financing.term_months,
    firstPaymentDate: financing.first_payment_date,
    paidInstallments,
    capitalPaidCents: extraCapitalCents,
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
  };
};
