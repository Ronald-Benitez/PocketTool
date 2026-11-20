import { resolvePendingPaymentDate } from '../pending';

describe('resolvePendingPaymentDate', () => {
  const now = new Date(2026, 10, 17, 10, 30).getTime(); // Nov 17, 2026

  it('keeps today when the mode is today', () => {
    expect(
      resolvePendingPaymentDate({
        mode: 'today',
        now,
        groupYear: 2026,
        groupMonth: 10,
        paymentDay: 5,
      })
    ).toBe(now);
  });

  it('uses the card payment day in the selected group month', () => {
    expect(
      resolvePendingPaymentDate({
        mode: 'payment_date',
        now,
        groupYear: 2026,
        groupMonth: 10,
        paymentDay: 5,
      })
    ).toBe(new Date(2026, 10, 5, 12, 0, 0, 0).getTime());
  });

  it('clamps the payment day to the last day of the month', () => {
    expect(
      resolvePendingPaymentDate({
        mode: 'payment_date',
        now,
        groupYear: 2026,
        groupMonth: 1, // February
        paymentDay: 31,
      })
    ).toBe(new Date(2026, 1, 28, 12, 0, 0, 0).getTime());
  });

  it('falls back to today without a payment day or group data', () => {
    expect(
      resolvePendingPaymentDate({
        mode: 'payment_date',
        now,
        groupYear: 2026,
        groupMonth: 10,
        paymentDay: null,
      })
    ).toBe(now);

    expect(
      resolvePendingPaymentDate({
        mode: 'payment_date',
        now,
        paymentDay: 5,
      })
    ).toBe(new Date(2026, 10, 5, 12, 0, 0, 0).getTime());
  });

  it('uses the next card payment day from today', () => {
    expect(
      resolvePendingPaymentDate({
        mode: 'next_payment_date',
        now,
        groupYear: 2026,
        groupMonth: 10,
        paymentDay: 20,
      })
    ).toBe(new Date(2026, 10, 20, 12, 0, 0, 0).getTime());

    expect(
      resolvePendingPaymentDate({
        mode: 'next_payment_date',
        now,
        groupYear: 2026,
        groupMonth: 10,
        paymentDay: 5,
      })
    ).toBe(new Date(2026, 11, 5, 12, 0, 0, 0).getTime());

    expect(
      resolvePendingPaymentDate({
        mode: 'next_payment_date',
        now,
        paymentDay: 17,
      })
    ).toBe(new Date(2026, 10, 17, 12, 0, 0, 0).getTime());
  });

  it('ignores the group month in next_payment_date mode', () => {
    const result = resolvePendingPaymentDate({
      mode: 'next_payment_date',
      now,
      groupYear: 2020,
      groupMonth: 0,
      paymentDay: 20,
    });

    expect(result).toBe(
      new Date(2026, 10, 20, 12, 0, 0, 0).getTime()
    );
  });

  it('uses the card payment day inside the group period', () => {
    const periodStart = new Date(2026, 9, 15).getTime();
    const periodEnd = new Date(2026, 10, 14, 23, 59, 59, 999).getTime();

    expect(
      resolvePendingPaymentDate({
        mode: 'payment_date',
        now,
        paymentDay: 20,
        periodStart,
        periodEnd,
      })
    ).toBe(new Date(2026, 9, 20, 12, 0, 0, 0).getTime());

    expect(
      resolvePendingPaymentDate({
        mode: 'payment_date',
        now,
        paymentDay: 5,
        periodStart,
        periodEnd,
      })
    ).toBe(new Date(2026, 10, 5, 12, 0, 0, 0).getTime());
  });
});
