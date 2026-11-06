import type { FinancingScheduleRow } from './types';

export type ExtraChargeType = 'insurance' | 'fees';

export type FinancingPaymentBreakdownInput = {
  amountCents: number;
  expectedCents: number;
  scheduledRow?: Pick<
    FinancingScheduleRow,
    'interestCents' | 'principalCents'
  > | null;
  extraPrincipalCents?: number | null;
  extraReducePaymentCents?: number | null;
  extraChargeType?: ExtraChargeType;
};

export type FinancingPaymentBreakdown = {
  amountCents: number;
  principalCents: number;
  interestCents: number;
  insuranceCents: number;
  feesCents: number;
  extraPrincipalCents: number;
  extraReducePaymentCents: number;
  extraChargeCents: number;
};

/**
 * Splits the amount paid into interest, principal, extra principal and the
 * difference charged as insurance or fees. The difference never increases the
 * principal or the interest of the financing.
 */
export const buildPaymentBreakdown = ({
  amountCents,
  expectedCents,
  scheduledRow,
  extraPrincipalCents,
  extraReducePaymentCents,
  extraChargeType = 'insurance',
}: FinancingPaymentBreakdownInput): FinancingPaymentBreakdown => {
  const amount = Math.max(0, Math.round(amountCents));
  const expected = Math.max(0, Math.round(expectedCents));
  const requestedExtraPrincipal = Math.max(
    0,
    Math.round(extraPrincipalCents ?? 0)
  );
  const requestedExtraReduce = Math.max(
    0,
    Math.round(extraReducePaymentCents ?? 0)
  );

  const appliedExtraPrincipal = Math.min(requestedExtraPrincipal, amount);
  const appliedExtraReduce = Math.min(
    requestedExtraReduce,
    Math.max(0, amount - appliedExtraPrincipal)
  );
  const extras = appliedExtraPrincipal + appliedExtraReduce;
  const extraCharge = Math.max(0, amount - expected - extras);
  const debtBudget = Math.max(0, amount - extraCharge - extras);

  const scheduledInterest = Math.max(0, scheduledRow?.interestCents ?? 0);
  const scheduledPrincipal = Math.max(
    0,
    scheduledRow?.principalCents ?? Math.max(0, expected - scheduledInterest)
  );
  const interest = Math.min(scheduledInterest, debtBudget);
  const principal = Math.min(
    scheduledPrincipal,
    Math.max(0, debtBudget - interest)
  );

  return {
    amountCents: amount,
    principalCents: principal,
    interestCents: interest,
    insuranceCents: extraChargeType === 'insurance' ? extraCharge : 0,
    feesCents: extraChargeType === 'fees' ? extraCharge : 0,
    extraPrincipalCents: appliedExtraPrincipal,
    extraReducePaymentCents: appliedExtraReduce,
    extraChargeCents: extraCharge,
  };
};
