import { useCallback } from 'react';

import {
  addConsumptionObligations,
  calculateCashBalance,
} from '@/src/domain/budgets/balance';
import type { SummaryMode } from '@/src/hooks/useSummaryMode';
import useResumesStore from '@/src/stores/ResumesStore';

import { useBudgetObligations } from './useBudgetObligations';
import { useBudgetPlan } from './useBudgetPlan';

export const useBudgetProjection = (
  groupId?: number,
  mode: SummaryMode = 'own'
) => {
  const planState = useBudgetPlan(groupId, mode);
  const obligationsState = useBudgetObligations(planState.plan);
  const { cashBalance } = useResumesStore();

  const consumptionBalance = planState.plan
    ? addConsumptionObligations(
        planState.plan.balance,
        obligationsState.obligations.totalConsumptionCents
      )
    : null;

  const cashProjection = planState.plan
    ? calculateCashBalance({
        currentCashCents: cashBalance,
        remainingIncomeCents: planState.plan.balance.remainingIncomeCents,
        remainingExpenseCents: planState.plan.balance.remainingExpenseCents,
        obligationsCashCents: obligationsState.obligations.totalCashCents,
      })
    : null;

  const refresh = useCallback(async () => {
    await Promise.all([planState.refresh(), obligationsState.refresh()]);
  }, [obligationsState.refresh, planState.refresh]);

  return {
    plan: planState.plan,
    consumptionBalance,
    cashBalance: cashProjection,
    obligations: obligationsState.obligations,
    loading: planState.loading || obligationsState.loading,
    refresh,
    repository: planState.repository,
  };
};
