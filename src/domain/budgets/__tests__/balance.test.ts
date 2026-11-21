import { calculateBudgetBalance } from '../balance';

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
});
