import type {
  BudgetBalanceView,
  BudgetCashView,
  BudgetPeriodRelation,
} from './types';

export type BudgetBalanceInput = {
  actualIncomeCents: number;
  actualExpenseCents: number;
  plannedIncomeCents: number;
  plannedExpenseCents: number;
  remainingExpenseLinesCents: number;
  uncoveredFixedCents: number;
  daysRemaining: number;
  periodRelation: BudgetPeriodRelation;
  hasIncomeLines: boolean;
};

/**
 * Projects the end-of-period consumption balance.
 *
 * The plan is consumption-based: savings-paid expenses and card payments are
 * already excluded before this function receives the amounts. The projection
 * adds only the expected remaining income and the expected remaining expense
 * (line run-rate plus uncovered fixed commitments).
 */
export const calculateBudgetBalance = ({
  actualIncomeCents,
  actualExpenseCents,
  plannedIncomeCents,
  plannedExpenseCents,
  remainingExpenseLinesCents,
  uncoveredFixedCents,
  daysRemaining,
  periodRelation,
  hasIncomeLines,
}: BudgetBalanceInput): BudgetBalanceView => {
  const actualNetCents = actualIncomeCents - actualExpenseCents;

  const remainingIncomeCents =
    periodRelation === 'past'
      ? 0
      : Math.max(0, plannedIncomeCents - actualIncomeCents);
  const remainingExpenseCents =
    periodRelation === 'past'
      ? 0
      : Math.max(0, remainingExpenseLinesCents) +
        Math.max(0, uncoveredFixedCents);

  const expectedIncomeCents = actualIncomeCents + remainingIncomeCents;
  const expectedExpenseCents = actualExpenseCents + remainingExpenseCents;
  const expectedNetCents = expectedIncomeCents - expectedExpenseCents;

  const remainingPlanExpenseCents = Math.max(
    0,
    plannedExpenseCents - actualExpenseCents
  );
  const dailyAvailableCents =
    periodRelation !== 'past' && daysRemaining > 0
      ? Math.floor(remainingPlanExpenseCents / daysRemaining)
      : 0;

  return {
    actualIncomeCents,
    actualExpenseCents,
    actualNetCents,
    expectedIncomeCents,
    expectedExpenseCents,
    expectedNetCents,
    expectedEndBalanceCents: expectedNetCents,
    remainingIncomeCents,
    remainingExpenseCents,
    remainingPlanExpenseCents,
    uncoveredFixedCents,
    daysRemaining,
    dailyAvailableCents,
    hasIncomeLines,
  };
};

export const addConsumptionObligations = (
  balance: BudgetBalanceView,
  obligationCents: number
): BudgetBalanceView => {
  const amount = Math.max(0, obligationCents);
  if (amount === 0) return balance;

  const expectedExpenseCents = balance.expectedExpenseCents + amount;
  return {
    ...balance,
    expectedExpenseCents,
    expectedNetCents: balance.expectedIncomeCents - expectedExpenseCents,
    expectedEndBalanceCents: balance.expectedIncomeCents - expectedExpenseCents,
    remainingExpenseCents: balance.remainingExpenseCents + amount,
  };
};

export const calculateCashBalance = ({
  currentCashCents,
  remainingIncomeCents,
  remainingExpenseCents,
  obligationsCashCents,
}: {
  currentCashCents: number;
  remainingIncomeCents: number;
  remainingExpenseCents: number;
  obligationsCashCents: number;
}): BudgetCashView => {
  const expectedEndCashCents =
    currentCashCents +
    remainingIncomeCents -
    remainingExpenseCents -
    Math.max(0, obligationsCashCents);

  return {
    currentCashCents,
    remainingIncomeCents,
    remainingExpenseCents,
    obligationsCashCents: Math.max(0, obligationsCashCents),
    expectedEndCashCents,
  };
};
