import { summarizeFinancing } from '../summary';

const base = {
  financed_cents: 120000,
  annual_rate_bps: 0,
  term_months: 12,
  first_payment_date: new Date(2026, 0, 1).getTime(),
};

describe('financing summary', () => {
  it('summarizes a zero-interest financing', () => {
    const summary = summarizeFinancing(base, []);
    expect(summary.balanceCents).toBe(120000);
    expect(summary.monthlyPaymentCents).toBe(10000);
    expect(summary.paidInstallments).toBe(0);
    expect(summary.monthsRemaining).toBe(12);
  });

  it('accounts for prior installments, capital and shared percentage', () => {
    const summary = summarizeFinancing(
      {
        ...base,
        paid_installments_before_app: 4,
        capital_paid_before_app_cents: 20000,
        is_shared: 1,
        shared_percent: 50,
      },
      []
    );
    expect(summary.balanceCents).toBe(60000);
    expect(summary.monthlyPaymentCents).toBe(7500);
    expect(summary.sharedPaymentCents).toBe(3750);
    expect(summary.monthsRemaining).toBe(8);
    expect(summary.paidInstallments).toBe(4);
  });

  it('applies a refinancing rate and remaining term', () => {
    const summary = summarizeFinancing(
      {
        ...base,
        paid_installments_before_app: 4,
        capital_paid_before_app_cents: 20000,
      },
      [],
      [
        {
          date: new Date(2026, 4, 1).getTime(),
          kind: 'refinance',
          new_annual_rate_bps: 1200,
          new_term_months: 8,
        },
      ]
    );

    expect(summary.balanceCents).toBe(60000);
    expect(summary.effectiveRateBps).toBe(1200);
    expect(summary.remainingTermMonths).toBe(8);
    expect(summary.monthlyPaymentCents).toBeGreaterThan(7500);
    expect(summary.totalInterestCents).toBeGreaterThan(0);
    expect(summary.adjustment?.kind).toBe('refinance');
  });

  it('combines consecutive adjustments without losing earlier changes', () => {
    const summary = summarizeFinancing(
      base,
      [],
      [
        {
          date: new Date(2026, 4, 1).getTime(),
          kind: 'rate_change',
          new_annual_rate_bps: 1200,
        },
        {
          date: new Date(2026, 5, 1).getTime(),
          kind: 'payment_change',
          new_payment_cents: 20000,
        },
      ]
    );

    expect(summary.effectiveRateBps).toBe(1200);
    expect(summary.monthlyPaymentCents).toBe(20000);
    expect(summary.adjustment?.kind).toBe('payment_change');
  });

  it('respects a fixed payment from an adjustment', () => {
    const summary = summarizeFinancing(base, [], [
      {
        date: new Date(2026, 4, 1).getTime(),
        kind: 'payment_change',
        new_payment_cents: 20000,
      },
    ]);

    expect(summary.monthlyPaymentCents).toBe(20000);
    expect(summary.monthsRemaining).toBe(6);
  });
});
