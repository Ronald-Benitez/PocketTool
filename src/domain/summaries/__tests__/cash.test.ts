import {
  getRecordCashCents,
  getRecordPaidByMeCents,
  getRecordReceivableCents,
  getSettlementsNetCents,
} from '../cash';

describe('cash summary', () => {
  it('counts the full purchase when the user paid it', () => {
    expect(
      getRecordPaidByMeCents({
        amount: 5000,
        own_amount_cents: 5000,
        shared_amount_cents: 5000,
      })
    ).toBe(10000);
  });

  it('counts only the own share when the user paid only that part', () => {
    expect(
      getRecordPaidByMeCents({
        amount: 5000,
        own_amount_cents: 5000,
        shared_amount_cents: 5000,
        paid_scope: 'own',
      })
    ).toBe(5000);
  });

  it('counts nothing when another person paid', () => {
    expect(
      getRecordPaidByMeCents({
        amount: 5000,
        own_amount_cents: 5000,
        shared_amount_cents: 5000,
        paid_by_person_id: 3,
      })
    ).toBe(0);
  });

  it('counts nothing for an expense paid from a saving', () => {
    expect(
      getRecordPaidByMeCents({
        amount: 5000,
        own_amount_cents: 5000,
        saving_id: 2,
      })
    ).toBe(0);
  });

  it('uses the effect to build cash buckets', () => {
    expect(getRecordCashCents({ amount: 10000 }, '+')).toBe(10000);
    expect(
      getRecordCashCents(
        {
          amount: 5000,
          own_amount_cents: 5000,
          shared_amount_cents: 5000,
        },
        '-'
      )
    ).toBe(10000);
    expect(getRecordCashCents({ amount: 5000 }, '=')).toBe(0);
  });

  it('nets settlements', () => {
    expect(
      getSettlementsNetCents([
        { amount_cents: 1000, direction: 'they_paid_me' },
        { amount_cents: 400, direction: 'i_paid_them' },
      ])
    ).toBe(600);
  });
});

describe('receivable summary', () => {
  it('counts the shared share when the user paid the total', () => {
    expect(
      getRecordReceivableCents({
        amount: 5000,
        own_amount_cents: 5000,
        shared_amount_cents: 5000,
      })
    ).toBe(5000);
  });

  it('does not count a receivable when another person paid', () => {
    expect(
      getRecordReceivableCents({
        amount: 5000,
        own_amount_cents: 5000,
        shared_amount_cents: 5000,
        paid_by_person_id: 3,
      })
    ).toBe(0);
  });

  it('does not count a receivable when each side paid their share', () => {
    expect(
      getRecordReceivableCents({
        amount: 5000,
        own_amount_cents: 5000,
        shared_amount_cents: 5000,
        paid_scope: 'own',
      })
    ).toBe(0);
  });

  it('does not count unshared or saving-linked records', () => {
    expect(getRecordReceivableCents({ amount: 5000 })).toBe(0);
    expect(
      getRecordReceivableCents({
        amount: 5000,
        shared_amount_cents: 5000,
        saving_id: 1,
      })
    ).toBe(0);
  });
});
