import { buildPaymentBreakdown } from '../payments';

const row = { interestCents: 2000, principalCents: 8000 };

describe('financing payment breakdown', () => {
  it('splits a matching payment into interest and principal', () => {
    expect(
      buildPaymentBreakdown({
        amountCents: 10000,
        expectedCents: 10000,
        scheduledRow: row,
      })
    ).toMatchObject({
      principalCents: 8000,
      interestCents: 2000,
      extraChargeCents: 0,
      insuranceCents: 0,
      feesCents: 0,
    });
  });

  it('records an overpayment as insurance or fees', () => {
    expect(
      buildPaymentBreakdown({
        amountCents: 11500,
        expectedCents: 10000,
        scheduledRow: row,
      })
    ).toMatchObject({
      principalCents: 8000,
      interestCents: 2000,
      extraChargeCents: 1500,
      insuranceCents: 1500,
      feesCents: 0,
    });

    expect(
      buildPaymentBreakdown({
        amountCents: 11500,
        expectedCents: 10000,
        scheduledRow: row,
        extraChargeType: 'fees',
      }).feesCents
    ).toBe(1500);
  });

  it('keeps extra principal separate from interest and fees', () => {
    expect(
      buildPaymentBreakdown({
        amountCents: 15000,
        expectedCents: 10000,
        scheduledRow: row,
        extraPrincipalCents: 5000,
      })
    ).toMatchObject({
      principalCents: 8000,
      interestCents: 2000,
      extraPrincipalCents: 5000,
      extraChargeCents: 0,
    });
  });

  it('reduces principal first when the payment is below the expected amount', () => {
    expect(
      buildPaymentBreakdown({
        amountCents: 8000,
        expectedCents: 10000,
        scheduledRow: row,
      })
    ).toMatchObject({
      principalCents: 6000,
      interestCents: 2000,
      extraChargeCents: 0,
    });
  });

  it('does not record extras above the amount actually paid', () => {
    expect(
      buildPaymentBreakdown({
        amountCents: 500,
        expectedCents: 10000,
        scheduledRow: row,
        extraPrincipalCents: 5000,
      })
    ).toMatchObject({
      extraPrincipalCents: 500,
      extraReducePaymentCents: 0,
      principalCents: 0,
      interestCents: 0,
    });
  });
});
