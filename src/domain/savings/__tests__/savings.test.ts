import { computeSavingSnapshot, contributionActualCents } from '../balances';
import {
  computeContributionSummary,
  suggestedContributionCents,
} from '../contributions';
import { buildSavingChart } from '../charts';
import { averageMonthlyContributions, computeGoalProgress } from '../goals';
import type { SavingLike, SavingMovementLike } from '../types';

const movement = (
  overrides: Partial<SavingMovementLike> & Pick<SavingMovementLike, 'kind' | 'amount_cents'>
): SavingMovementLike => ({
  previous_amount: 0,
  new_amount: overrides.amount_cents,
  change_date: 1,
  period_year: 2026,
  period_month: 11,
  ...overrides,
});

describe('savings domain', () => {
  it('separates own and shared deposits', () => {
    const snapshot = computeSavingSnapshot(
      [
        movement({ kind: 'initial', amount_cents: 500 }),
        movement({ kind: 'deposit', amount_cents: 500, person_id: 1 }),
      ],
      [{ person_id: 1, share_percent: 50 }]
    );

    expect(snapshot.ownCents).toBe(500);
    expect(snapshot.sharedCents).toBe(500);
    expect(snapshot.totalCents).toBe(1000);
    expect(snapshot.participants[0].balanceCents).toBe(500);
  });

  it('distributes interest by participant percentage and keeps the remainder', () => {
    const snapshot = computeSavingSnapshot(
      [
        movement({ kind: 'initial', amount_cents: 1000 }),
        movement({ kind: 'interest', amount_cents: 101 }),
      ],
      [{ person_id: 1, share_percent: 50 }]
    );

    expect(snapshot.interestCents).toBe(101);
    expect(snapshot.sharedCents).toBe(50);
    expect(snapshot.ownCents).toBe(1051);
    expect(snapshot.totalCents).toBe(1101);
  });

  it('calculates monthly contribution status', () => {
    expect(
      suggestedContributionCents({
        rule: 'percent',
        percentBps: 1000,
        incomeCents: 100000,
      })
    ).toEqual({ suggestedCents: 10000, hasBase: true });

    const summary = computeContributionSummary({
      rule: 'percent',
      percentBps: 1000,
      incomeCents: 100000,
      actualCents: 12000,
      scope: 'own',
    });
    expect(summary.status).toBe('exceeded');
    expect(summary.suggestedCents).toBe(10000);
  });

  it('counts only contributions of the selected scope for the period', () => {
    const movements = [
      movement({ kind: 'deposit', amount_cents: 300 }),
      movement({ kind: 'deposit', amount_cents: 200, person_id: 2 }),
      movement({ kind: 'deposit', amount_cents: 100, period_month: 10 }),
    ];
    expect(contributionActualCents(movements, 2026, 11, 'own')).toBe(300);
    expect(contributionActualCents(movements, 2026, 11, 'global')).toBe(500);
  });

  it('projects the goal from actual or expected contributions', () => {
    const saving: Pick<SavingLike, 'target_amount_cents' | 'target_date'> = {
      target_amount_cents: 100000,
      target_date: null,
    };
    const progress = computeGoalProgress({
      saving,
      currentCents: 40000,
      expectedMonthlyCents: 5000,
      actualMonthlyCents: 10000,
      now: new Date(2026, 10, 1).getTime(),
    });

    expect(progress.hasGoal).toBe(true);
    expect(progress.remainingCents).toBe(60000);
    expect(progress.progressPercent).toBe(40);
    expect(progress.actualMonths).toBe(6);
    expect(progress.expectedMonths).toBe(12);
  });

  it('averages recent monthly contributions', () => {
    const movements = [
      movement({ kind: 'deposit', amount_cents: 1000, period_month: 9 }),
      movement({ kind: 'deposit', amount_cents: 3000, period_month: 10 }),
      movement({ kind: 'deposit', amount_cents: 2000, period_month: 11 }),
    ];
    expect(averageMonthlyContributions(movements, 'own', 3)).toBe(2000);
  });

  it('builds chart series for total, own and shared', () => {
    const points = buildSavingChart(
      [
        movement({ kind: 'initial', amount_cents: 1000, change_date: 1 }),
        movement({
          kind: 'deposit',
          amount_cents: 500,
          person_id: 1,
          change_date: 2,
        }),
      ],
      [{ person_id: 1, share_percent: 50 }]
    );

    expect(points).toHaveLength(2);
    expect(points[1].totalCents).toBe(1500);
    expect(points[1].ownCents).toBe(1000);
    expect(points[1].sharedCents).toBe(500);
  });
});
