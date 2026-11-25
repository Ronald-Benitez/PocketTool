import {
  addConsumptionObligations,
  calculateBudgetBalance,
  calculateCashBalance,
} from '../balance';

const base = {
  actualIncomeCents: 100000,
  actualExpenseCents: 40000,
  plannedIncomeCents: 300000,
  plannedExpenseCents: 200000,
  remainingExpenseLinesCents: 60000,
  uncoveredFixedCents: 10000,
  daysRemaining: 10,
  periodRelation: 'current' as const,
  hasIncomeLines: true,
};

describe('budget balance', () => {
  it('projects current net plus remaining income and expense', () => {
    const balance = calculateBudgetBalance(base);
    expect(balance.actualNetCents).toBe(60000);
    expect(balance.remainingIncomeCents).toBe(200000);
    expect(balance.remainingExpenseCents).toBe(70000);
    expect(balance.expectedEndBalanceCents).toBe(190000);
    expect(balance.dailyAvailableCents).toBe(16000);
    expect(balance.hasIncomeLines).toBe(true);
  });

  it('uses actual net for a past period', () => {
    const balance = calculateBudgetBalance({
      ...base,
      periodRelation: 'past',
    });
    expect(balance.remainingIncomeCents).toBe(0);
    expect(balance.remainingExpenseCents).toBe(0);
    expect(balance.expectedEndBalanceCents).toBe(60000);
    expect(balance.dailyAvailableCents).toBe(0);
  });

  it('uses the full plan for a future period', () => {
    const balance = calculateBudgetBalance({
      ...base,
      actualIncomeCents: 0,
      actualExpenseCents: 0,
      remainingExpenseLinesCents: 200000,
      uncoveredFixedCents: 0,
      periodRelation: 'future',
    });
    expect(balance.remainingIncomeCents).toBe(300000);
    expect(balance.remainingExpenseCents).toBe(200000);
    expect(balance.expectedEndBalanceCents).toBe(100000);
  });

  it('allows a negative expected balance', () => {
    const balance = calculateBudgetBalance({
      ...base,
      plannedIncomeCents: 50000,
      remainingExpenseLinesCents: 100000,
    });
    expect(balance.expectedEndBalanceCents).toBeLessThan(0);
    expect(balance.hasIncomeLines).toBe(true);
  });

  it('adds consumption obligations to the expected expense', () => {
    const balance = calculateBudgetBalance(base);
    const adjusted = addConsumptionObligations(balance, 25000);
    expect(adjusted.expectedExpenseCents).toBe(
      balance.expectedExpenseCents + 25000
    );
    expect(adjusted.expectedEndBalanceCents).toBe(
      balance.expectedEndBalanceCents - 25000
    );
    expect(adjusted.remainingExpenseCents).toBe(
      balance.remainingExpenseCents + 25000
    );
  });

  it('projects cash from current cash, remaining flows and obligations', () => {
    const cash = calculateCashBalance({
      currentCashCents: 50000,
      remainingIncomeCents: 100000,
      remainingExpenseCents: 40000,
      obligationsCashCents: 30000,
    });
    expect(cash.expectedEndCashCents).toBe(80000);
  });
});
