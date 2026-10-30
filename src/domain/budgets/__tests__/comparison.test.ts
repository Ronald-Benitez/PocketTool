import { calculateBudgetPlanView } from '../comparison';
import {
  buildBudgetComparisonChart,
  buildBudgetDistributionPie,
  buildBudgetHealthPie,
  buildBudgetProjectionChart,
  type BudgetChartLabels,
} from '../charts';
import type { BudgetComparisonInput } from '../types';

const labels: BudgetChartLabels = {
  healthTitle: 'Health',
  distributionTitle: 'Distribution',
  comparisonTitle: 'Comparison',
  projectionTitle: 'Projection',
  planned: 'Planned',
  actual: 'Actual',
  projected: 'Projected',
  spent: 'Spent',
  remaining: 'Remaining',
  onTrack: 'On track',
  warning: 'Near limit',
  over: 'Over',
  fixedPending: 'Fixed pending',
};

const baseInput = (): BudgetComparisonInput => ({
  plan: {
    id: 1,
    group_id: 10,
    alert_threshold_percent: 80,
    plan_name: 'October',
    notes: null,
  },
  planName: 'October',
  month: 10,
  year: 2026,
  templateName: null,
  lines: [
    {
      id: 1,
      budget_plan_id: 1,
      category_id: 1,
      record_type_id: 2,
      scope: 'category',
      source: 'manual',
      planned_amount: 200000,
      priority: 2,
      sort_order: 0,
    },
    {
      id: 2,
      budget_plan_id: 1,
      category_id: 2,
      record_type_id: 2,
      fixed_id: 7,
      scope: 'fixed',
      source: 'fixed',
      planned_amount: 30000,
      priority: 2,
      sort_order: 1,
    },
  ],
  records: [
    {
      id: 1,
      amount: 50000,
      category_id: 1,
      record_type_id: 2,
      fixed_id: null,
    },
    {
      id: 2,
      amount: 25000,
      category_id: 1,
      record_type_id: 2,
      fixed_id: null,
    },
    {
      id: 3,
      amount: 9000,
      category_id: 3,
      record_type_id: 2,
      fixed_id: null,
    },
  ],
  fixeds: [
    {
      id: 7,
      fixed_name: 'Rent',
      fixed_amount: 30000,
      fixed_day: 5,
      category_id: 2,
      record_type_id: 2,
    },
  ],
  categories: [
    { id: 1, category_name: 'Food' },
    { id: 2, category_name: 'Rent' },
    { id: 3, category_name: 'Fun' },
  ],
  recordTypes: [
    { id: 1, type_name: 'Income', effect: '+' },
    { id: 2, type_name: 'Expense', effect: '-' },
    { id: 3, type_name: 'Payments', effect: '-' },
    { id: 4, type_name: 'Transfer', effect: '=' },
  ],
  excludedRecordTypeIds: [3],
  now: new Date(2026, 9, 15),
});

describe('budget comparison', () => {
  it('compares category lines with records and excludes the payments type', () => {
    const view = calculateBudgetPlanView(baseInput());
    const food = view.lines.find((line) => line.categoryId === 1);

    expect(food?.actualCents).toBe(75000);
    expect(food?.varianceCents).toBe(125000);
    expect(food?.usagePercent).toBe(37.5);
    expect(food?.status).toBe('on_track');
    expect(view.totals.actualExpenseCents).toBe(84000);
  });

  it('marks a fixed commitment as pending until it has a record', () => {
    const view = calculateBudgetPlanView(baseInput());
    const rent = view.lines.find((line) => line.scope === 'fixed');

    expect(rent?.pendingFixedCents).toBe(30000);
    expect(rent?.actualCents).toBe(0);
    expect(rent?.status).toBe('fixed_pending');
    expect(view.totals.pendingFixedCents).toBe(30000);
    expect(view.insights.some((insight) => insight.kind === 'fixed_pending')).toBe(true);
  });

  it('assigns fixed records to the fixed line without double counting', () => {
    const input = baseInput();
    input.records.push({
      id: 4,
      amount: 30000,
      category_id: 2,
      record_type_id: 2,
      fixed_id: 7,
    });
    input.lines.push({
      id: 3,
      budget_plan_id: 1,
      category_id: 2,
      record_type_id: 2,
      scope: 'category',
      source: 'manual',
      planned_amount: 50000,
      priority: 2,
      sort_order: 2,
    });

    const view = calculateBudgetPlanView(input);
    const rentFixed = view.lines.find((line) => line.scope === 'fixed');
    const rentCategory = view.lines.find(
      (line) => line.scope === 'category' && line.categoryId === 2
    );

    expect(rentFixed?.actualCents).toBe(30000);
    expect(rentFixed?.status).toBe('warning');
    expect(rentCategory?.actualCents).toBe(0);
  });

  it('reports unplanned spending without a matching line', () => {
    const view = calculateBudgetPlanView(baseInput());
    expect(view.unplanned).toHaveLength(1);
    expect(view.unplanned[0].categoryName).toBe('Fun');
    expect(view.unplanned[0].actualCents).toBe(9000);
    expect(
      view.insights.some(
        (insight) => insight.kind === 'unplanned_spending' && insight.amountCents === 9000
      )
    ).toBe(true);
  });

  it('flags over-budget lines and near-limit lines', () => {
    const input = baseInput();
    input.lines[0].planned_amount = 50000;
    const view = calculateBudgetPlanView(input);
    const food = view.lines.find((line) => line.categoryId === 1);

    expect(food?.status).toBe('over');
    expect(
      view.insights.some(
        (insight) => insight.kind === 'over_budget' && insight.amountCents === 25000
      )
    ).toBe(true);
  });

  it('builds charts and sanitizes labels', () => {
    const input = baseInput();
    input.categories[0].category_name = 'Food "and" [drinks]';
    const view = calculateBudgetPlanView(input);

    const health = buildBudgetHealthPie(view, labels);
    const distribution = buildBudgetDistributionPie(view, labels);
    const comparison = buildBudgetComparisonChart(view, labels);
    const projection = buildBudgetProjectionChart(view, labels);

    expect(health).toContain('pie showData');
    expect(distribution).toContain('Food and drinks');
    expect(distribution).not.toContain('"and"');
    expect(comparison).toContain('xychart-beta');
    expect(comparison).toContain('bar [');
    expect(projection).toContain('xychart-beta');
    expect(projection).toContain('Projection');
  });

  it('returns null charts when there is no expense data', () => {
    const input = baseInput();
    input.lines = [];
    input.records = [];
    const view = calculateBudgetPlanView(input);

    expect(buildBudgetHealthPie(view, labels)).toBeNull();
    expect(buildBudgetDistributionPie(view, labels)).toBeNull();
    expect(buildBudgetComparisonChart(view, labels)).toBeNull();
    expect(buildBudgetProjectionChart(view, labels)).toBeNull();
  });
});
