import {
  buildSchedule,
  calculatePaymentCents,
  cardUtilization,
  monthsToAmortize,
  paymentDifferenceToFees,
  sharedAmount,
} from '../amortization';

describe('credit amortization', () => {
  it('calculates a zero-interest installment', () => {
    expect(
      calculatePaymentCents({
        principalCents: 120000,
        annualRateBps: 0,
        termMonths: 12,
      })
    ).toBe(10000);

    const schedule = buildSchedule({
      principalCents: 120000,
      annualRateBps: 0,
      termMonths: 12,
      firstPaymentDate: new Date(2026, 0, 1).getTime(),
    });
    expect(schedule.rows).toHaveLength(12);
    expect(schedule.totalPaidCents).toBe(120000);
    expect(schedule.rows[11].balanceCents).toBe(0);
  });

  it('calculates interest and a decreasing balance', () => {
    const payment = calculatePaymentCents({
      principalCents: 1000000,
      annualRateBps: 1200,
      termMonths: 12,
    });
    expect(payment).toBeGreaterThan(80000);
    expect(payment).toBeLessThan(100000);

    const schedule = buildSchedule({
      principalCents: 1000000,
      annualRateBps: 1200,
      termMonths: 12,
      firstPaymentDate: new Date(2026, 0, 1).getTime(),
    });
    expect(schedule.rows).toHaveLength(12);
    expect(schedule.totalInterestCents).toBeGreaterThan(0);
    expect(schedule.rows[11].balanceCents).toBe(0);
  });

  it('accounts for installments and capital already paid', () => {
    const schedule = buildSchedule({
      principalCents: 120000,
      annualRateBps: 0,
      termMonths: 12,
      paidInstallments: 4,
      capitalPaidCents: 20000,
      firstPaymentDate: new Date(2026, 0, 1).getTime(),
    });
    expect(schedule.rows).toHaveLength(8);
    expect(schedule.rows[0].balanceCents).toBe(60000 - schedule.rows[0].principalCents);
    expect(schedule.totalPaidCents).toBe(60000);
  });

  it('calculates how many months a fixed payment needs', () => {
    expect(
      monthsToAmortize({
        balanceCents: 120000,
        annualRateBps: 0,
        paymentCents: 8000,
      })
    ).toBe(15);
    expect(
      monthsToAmortize({
        balanceCents: 120000,
        annualRateBps: 0,
        paymentCents: 0,
      })
    ).toBe(0);
  });

  it('handles card utilization and shared payments', () => {
    expect(cardUtilization({ limitCents: 100000, usedCents: 25000 })).toEqual({
      limitCents: 100000,
      usedCents: 25000,
      availableCents: 75000,
      utilizationPercent: 25,
    });
    expect(sharedAmount({ amountCents: 10000, sharedPercent: 50 })).toBe(5000);
    expect(paymentDifferenceToFees({ expectedCents: 10000, paidCents: 11500 })).toBe(1500);
  });
});
