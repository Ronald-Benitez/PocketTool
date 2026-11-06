import type {
  CardUtilization,
  FinancingSchedule,
  FinancingScheduleRow,
} from './types';

export const addMonths = (date: number, months: number) => {
  const value = new Date(date);
  value.setMonth(value.getMonth() + months);
  return value.getTime();
};

export const monthlyRateFromBps = (annualRateBps: number) =>
  annualRateBps / 10000 / 12;

export const calculatePaymentCents = ({
  principalCents,
  annualRateBps,
  termMonths,
}: {
  principalCents: number;
  annualRateBps: number;
  termMonths: number;
}) => {
  if (principalCents <= 0 || termMonths <= 0) return 0;
  const rate = monthlyRateFromBps(annualRateBps);
  if (rate <= 0) return Math.round(principalCents / termMonths);
  const factor = Math.pow(1 + rate, -termMonths);
  return Math.round((principalCents * rate) / (1 - factor));
};

export const monthsToAmortize = ({
  balanceCents,
  annualRateBps,
  paymentCents,
}: {
  balanceCents: number;
  annualRateBps: number;
  paymentCents: number;
}) => {
  if (balanceCents <= 0 || paymentCents <= 0) return 0;
  const rate = monthlyRateFromBps(annualRateBps);
  if (rate <= 0) return Math.ceil(balanceCents / paymentCents);
  if (paymentCents <= balanceCents * rate) return 0;
  return Math.max(
    1,
    Math.ceil(
      -Math.log(1 - (balanceCents * rate) / paymentCents) / Math.log(1 + rate)
    )
  );
};

export const buildSchedule = ({
  principalCents,
  annualRateBps,
  termMonths,
  firstPaymentDate,
  paidInstallments = 0,
  capitalPaidCents = 0,
  extraPrincipalCents = 0,
  extraRecurringCents = 0,
  paymentOverrideCents,
  startIndex,
}: {
  principalCents: number;
  annualRateBps: number;
  termMonths: number;
  firstPaymentDate?: number | null;
  paidInstallments?: number;
  capitalPaidCents?: number;
  extraPrincipalCents?: number;
  extraRecurringCents?: number;
  paymentOverrideCents?: number | null;
  startIndex?: number;
}): FinancingSchedule => {
  const originalTerm = Math.max(1, Math.round(termMonths));
  const paid = Math.max(0, Math.min(originalTerm, Math.round(paidInstallments)));
  const firstRowIndex = Math.max(0, Math.round(startIndex ?? paid));
  const rate = monthlyRateFromBps(annualRateBps);
  const originalPayment = calculatePaymentCents({
    principalCents,
    annualRateBps,
    termMonths: originalTerm,
  });

  let balance = principalCents;
  for (let index = 0; index < paid && balance > 0; index += 1) {
    const interest = Math.round(balance * rate);
    const principal = Math.max(0, originalPayment - interest);
    balance = Math.max(0, balance - principal);
  }
  balance = Math.max(0, balance - Math.max(0, capitalPaidCents));

  const remainingTerm = Math.max(0, originalTerm - paid);
  if (balance <= 0 || remainingTerm === 0) {
    return {
      startingBalanceCents: 0,
      paymentCents: 0,
      rows: [],
      totalInterestCents: 0,
      totalPaidCents: 0,
      payoffDate: null,
    };
  }

  const calculatedPayment = calculatePaymentCents({
    principalCents: balance,
    annualRateBps,
    termMonths: remainingTerm,
  });
  const payment =
    paymentOverrideCents != null && paymentOverrideCents > 0
      ? paymentOverrideCents
      : calculatedPayment;
  const rows: FinancingScheduleRow[] = [];
  let currentBalance = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let firstExtra = Math.max(0, extraPrincipalCents);
  const recurringExtra = Math.max(0, extraRecurringCents);

  for (let index = 0; index < remainingTerm && currentBalance > 0; index += 1) {
    const interest = Math.round(currentBalance * rate);
    let principal = payment - interest;
    if (index === remainingTerm - 1) {
      principal = currentBalance;
    }
    principal = Math.max(0, principal);
    const extra = firstExtra + recurringExtra;
    firstExtra = 0;
    if (principal + extra <= 0) break;
    const appliedPrincipal = Math.min(currentBalance, principal + extra);
    const actualPayment = interest + appliedPrincipal;
    currentBalance = Math.max(0, currentBalance - appliedPrincipal);
    totalInterest += interest;
    totalPaid += actualPayment;
    rows.push({
      number: firstRowIndex + index + 1,
      date: addMonths(firstPaymentDate ?? Date.now(), firstRowIndex + index),
      paymentCents: actualPayment,
      interestCents: interest,
      principalCents: appliedPrincipal,
      balanceCents: currentBalance,
    });
  }

  return {
    startingBalanceCents: balance,
    paymentCents: payment,
    rows,
    totalInterestCents: totalInterest,
    totalPaidCents: totalPaid,
    payoffDate: rows.length ? rows[rows.length - 1].date : null,
  };
};

export const cardUtilization = ({
  limitCents,
  usedCents,
}: {
  limitCents: number;
  usedCents: number;
}): CardUtilization => {
  const limit = Math.max(0, limitCents);
  const used = Math.max(0, usedCents);
  return {
    limitCents: limit,
    usedCents: used,
    availableCents: Math.max(0, limit - used),
    utilizationPercent: limit > 0 ? Math.min(100, (used / limit) * 100) : 0,
  };
};

export const paymentDifferenceToFees = ({
  expectedCents,
  paidCents,
}: {
  expectedCents: number;
  paidCents: number;
}) => Math.max(0, paidCents - expectedCents);

export const sharedAmount = ({
  amountCents,
  sharedPercent,
}: {
  amountCents: number;
  sharedPercent?: number | null;
}) => {
  if (sharedPercent == null) return amountCents;
  const percent = Math.max(0, Math.min(100, sharedPercent));
  return Math.round((amountCents * percent) / 100);
};
