import type { BudgetBalanceView, BudgetPeriodRelation } from './types';

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
