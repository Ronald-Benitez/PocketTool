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
});
