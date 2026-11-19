import {
  cardInstallmentUsage,
  hasCreditCardSavingConflict,
  isCreditCardPaymentMethod,
} from '../cards';

const base = {
  kind: 'installment_purchase',
  status: 'active',
  payment_method_id: 7,
  financed_cents: 120000,
  annual_rate_bps: 0,
  term_months: 12,
  first_payment_date: new Date(2026, 0, 1).getTime(),
};

describe('isCreditCardPaymentMethod', () => {
  it('detects the card flag, cutoff and visual kind', () => {
    expect(isCreditCardPaymentMethod({ is_credit_card: 1 })).toBe(true);
    expect(isCreditCardPaymentMethod({ closing_date: 15 })).toBe(true);
    expect(isCreditCardPaymentMethod({ visual_kind: 'credit_card' })).toBe(
      true
    );
  });

  it('ignores non-card methods', () => {
    expect(isCreditCardPaymentMethod(null)).toBe(false);
    expect(
      isCreditCardPaymentMethod({
        is_credit_card: 0,
        closing_date: 0,
        visual_kind: 'cash',
      })
    ).toBe(false);
  });
});

describe('hasCreditCardSavingConflict', () => {
  it('blocks a credit card purchase paid from a saving', () => {
    expect(
      hasCreditCardSavingConflict({
        savingId: 3,
        paymentMethod: { is_credit_card: 1 },
      })
    ).toBe(true);
  });

  it('allows a debit method or no saving', () => {
    expect(
      hasCreditCardSavingConflict({
        savingId: 3,
        paymentMethod: { is_credit_card: 0, visual_kind: 'cash' },
      })
    ).toBe(false);
    expect(
      hasCreditCardSavingConflict({
        savingId: null,
        paymentMethod: { is_credit_card: 1 },
      })
    ).toBe(false);
  });
});

describe('card installment usage', () => {
  it('adds the pending balance of active 0% purchases to the card', () => {
    const usage = cardInstallmentUsage([
      { ...base, paid_installments_before_app: 4 },
    ]);
    expect(usage.get(7)).toBe(80000);
  });

  it('groups several purchases for the same card', () => {
    const usage = cardInstallmentUsage([
      { ...base, paid_installments_before_app: 4 },
      { ...base, financed_cents: 60000, term_months: 6, paid_installments_before_app: 2 },
    ]);
    expect(usage.get(7)).toBe(80000 + 40000);
  });

  it('ignores interest-bearing, paid and non-installment purchases', () => {
    const usage = cardInstallmentUsage([
      { ...base, annual_rate_bps: 1200 },
      { ...base, status: 'paid' },
      { ...base, kind: 'bank_loan' },
      { ...base, payment_method_id: null },
      {
        ...base,
        FinancingAdjustments: [
          { date: 1, kind: 'rate_change', new_annual_rate_bps: 600 },
        ],
      },
    ]);
    expect(usage.size).toBe(0);
  });
});
