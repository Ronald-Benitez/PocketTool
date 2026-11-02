import { simulateFinancing } from '../simulations';

const financing = {
  financed_cents: 600000,
  annual_rate_bps: 1200,
  term_months: 12,
  first_payment_date: new Date(2026, 0, 1).getTime(),
};

describe('financing simulations', () => {
  it('saves interest and months with a one-time extra principal', () => {
    const result = simulateFinancing(financing, [], [], {
      extraOnceCents: 100000,
      extraOnceMode: 'reduce_term',
    });

    expect(result.simulated.balanceCents).toBe(
      result.baseline.balanceCents
    );
    expect(result.interestSavedCents).toBeGreaterThan(0);
    expect(result.monthsSaved).toBeGreaterThan(0);
    expect(result.simulated.payoffDate).not.toBeNull();
  });

  it('reduces the payment when the extra principal keeps the term', () => {
    const result = simulateFinancing(financing, [], [], {
      extraOnceCents: 100000,
      extraOnceMode: 'reduce_payment',
    });

    expect(result.simulated.monthlyPaymentCents).toBeLessThan(
      result.baseline.monthlyPaymentCents
    );
    expect(result.monthsSaved).toBe(0);
    expect(result.interestSavedCents).toBeGreaterThan(0);
  });

  it('saves interest with a recurring extra payment', () => {
    const result = simulateFinancing(financing, [], [], {
      extraRecurringCents: 10000,
    });

    expect(result.monthsSaved).toBeGreaterThan(0);
    expect(result.interestSavedCents).toBeGreaterThan(0);
  });

  it('compares a lower rate against the current financing', () => {
    const result = simulateFinancing(financing, [], [], {
      annualRateBps: 600,
    });

    expect(result.simulated.monthlyPaymentCents).toBeLessThan(
      result.baseline.monthlyPaymentCents
    );
    expect(result.interestSavedCents).toBeGreaterThan(0);
  });

  it('extends the payoff date with a longer remaining term', () => {
    const result = simulateFinancing(financing, [], [], {
      remainingTermMonths: 24,
    });

    expect(result.monthsSaved).toBeLessThan(0);
    expect(result.simulated.monthlyPaymentCents).toBeLessThan(
      result.baseline.monthlyPaymentCents
    );
  });
});
