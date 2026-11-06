import {
  summarizeFinancing,
  type FinancingAdjustmentInput,
  type FinancingPaymentInput,
  type FinancingSummary,
  type FinancingSummaryInput,
  type FinancingSummaryOptions,
} from './summary';

export type FinancingSimulationScenario = FinancingSummaryOptions;

export type FinancingSimulationResult = {
  baseline: FinancingSummary;
  simulated: FinancingSummary;
  interestSavedCents: number;
  monthsSaved: number;
  paymentDeltaCents: number;
};

export const simulateFinancing = (
  financing: FinancingSummaryInput,
  payments: FinancingPaymentInput[],
  adjustments: FinancingAdjustmentInput[],
  scenario: FinancingSimulationScenario
): FinancingSimulationResult => {
  const baseline = summarizeFinancing(financing, payments, adjustments);
  const simulated = summarizeFinancing(financing, payments, adjustments, {
    ...scenario,
    ignoreAgreedPayment:
      scenario.extraOnceMode === 'reduce_payment' ||
      scenario.annualRateBps !== undefined ||
      scenario.remainingTermMonths !== undefined ||
      scenario.ignoreAgreedPayment,
  });

  return {
    baseline,
    simulated,
    interestSavedCents:
      baseline.totalInterestCents - simulated.totalInterestCents,
    monthsSaved: baseline.monthsRemaining - simulated.monthsRemaining,
    paymentDeltaCents:
      simulated.monthlyPaymentCents - baseline.monthlyPaymentCents,
  };
};
