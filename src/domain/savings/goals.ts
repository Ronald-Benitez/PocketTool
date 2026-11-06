import type {
  SavingGoalProgress,
  SavingLike,
  SavingMovementLike,
} from './types';

const addMonths = (date: number, months: number) => {
  const value = new Date(date);
  value.setMonth(value.getMonth() + months);
  return value.getTime();
};

const monthsFor = (remainingCents: number, monthlyCents: number) => {
  if (remainingCents <= 0) return 0;
  if (monthlyCents <= 0) return null;
  return Math.max(1, Math.ceil(remainingCents / monthlyCents));
};

export const averageMonthlyContributions = (
  movements: SavingMovementLike[],
  scope: 'own' | 'global',
  months = 3
) => {
  if (months <= 0) return 0;
  const totals = new Map<string, number>();
  movements.forEach((movement) => {
    if (movement.kind !== 'initial' && movement.kind !== 'deposit') return;
    if (scope === 'own' && movement.person_id != null) return;
    if (!movement.period_year || !movement.period_month) return;
    const key = `${movement.period_year}-${movement.period_month}`;
    totals.set(
      key,
      (totals.get(key) ?? 0) + Math.max(0, movement.amount_cents ?? 0)
    );
  });
  const values = [...totals.values()].sort((a, b) => b - a).slice(0, months);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
};

export const computeGoalProgress = ({
  saving,
  currentCents,
  expectedMonthlyCents = 0,
  actualMonthlyCents = 0,
  now = Date.now(),
}: {
  saving: Pick<SavingLike, 'target_amount_cents' | 'target_date'>;
  currentCents: number;
  expectedMonthlyCents?: number;
  actualMonthlyCents?: number;
  now?: number;
}): SavingGoalProgress => {
  const targetCents = Math.max(0, saving.target_amount_cents ?? 0);
  if (targetCents <= 0) {
    return {
      hasGoal: false,
      targetCents: 0,
      currentCents,
      remainingCents: 0,
      progressPercent: 0,
      reached: false,
      actualMonths: null,
      expectedMonths: null,
      actualDate: null,
      expectedDate: null,
    };
  }

  const remainingCents = Math.max(0, targetCents - currentCents);
  const reached = currentCents >= targetCents;
  const actualMonths = reached
    ? 0
    : monthsFor(remainingCents, actualMonthlyCents);
  const expectedMonths = reached
    ? 0
    : monthsFor(remainingCents, expectedMonthlyCents);

  return {
    hasGoal: true,
    targetCents,
    currentCents,
    remainingCents,
    progressPercent: Math.min(100, (currentCents / targetCents) * 100),
    reached,
    actualMonths,
    expectedMonths,
    actualDate:
      actualMonths == null ? null : addMonths(now, Math.max(0, actualMonths)),
    expectedDate:
      expectedMonths == null
        ? null
        : addMonths(now, Math.max(0, expectedMonths)),
  };
};
