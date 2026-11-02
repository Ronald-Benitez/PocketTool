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
});
