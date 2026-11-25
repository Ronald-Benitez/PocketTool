import {
  buildFinancingEntry,
  buildPersonStatements,
  buildPurchaseEntries,
  buildPurchaseEntry,
  buildSettlementEntry,
  buildSettlementForBalance,
  getBalanceDirection,
  pendingBalancesAsOf,
  summarizePersonStatement,
  type PersonStatementEntry,
} from '../statement';

const basePurchase = {
  key: 'record-1-person-1',
  personId: 1,
  source: 'record' as const,
  ownerId: 10,
  recordId: 10,
  groupId: 1,
  label: 'Groceries',
  date: 1000,
  totalCents: 10000,
  ownCents: 5000,
  sharedCents: 5000,
  personSharePercent: 50,
  personShareCents: 5000,
  paidByPersonId: null,
  paidScope: 'full' as const,
};

describe('person statement', () => {
  it('the user paid the full purchase: the person owes their share', () => {
    const entry = buildPurchaseEntry(basePurchase);

    expect(entry.direction).toBe('theyOweMe');
    expect(entry.balanceDeltaCents).toBe(5000);
    expect(entry.cashPaidByMeCents).toBe(10000);
    expect(entry.cashPaidByPersonCents).toBe(0);
  });

  it('the user paid only their own share: no debt', () => {
    const entry = buildPurchaseEntry({ ...basePurchase, paidScope: 'own' });

    expect(entry.direction).toBeNull();
    expect(entry.balanceDeltaCents).toBe(0);
    expect(entry.cashPaidByMeCents).toBe(5000);
    expect(entry.cashPaidByPersonCents).toBe(5000);
  });

  it('the person paid the full purchase: the user owes their own share', () => {
    const entry = buildPurchaseEntry({
      ...basePurchase,
      paidByPersonId: 1,
    });

    expect(entry.direction).toBe('iOweThem');
    expect(entry.balanceDeltaCents).toBe(-5000);
    expect(entry.cashPaidByMeCents).toBe(0);
    expect(entry.cashPaidByPersonCents).toBe(10000);
  });

  it('the person paid only their share: no debt', () => {
    const entry = buildPurchaseEntry({
      ...basePurchase,
      paidByPersonId: 1,
      paidScope: 'own',
    });

    expect(entry.balanceDeltaCents).toBe(0);
    expect(entry.cashPaidByMeCents).toBe(5000);
    expect(entry.cashPaidByPersonCents).toBe(5000);
  });

  it('counts each participant own share when everybody paid their part', () => {
    const first = buildPurchaseEntry({
      ...basePurchase,
      ownCents: 5000,
      sharedCents: 5000,
      personSharePercent: 30,
      personShareCents: 3000,
      paidScope: 'own',
    });
    const second = buildPurchaseEntry({
      ...basePurchase,
      key: 'record-1-person-2',
      personId: 2,
      ownCents: 5000,
      sharedCents: 5000,
      personSharePercent: 20,
      personShareCents: 2000,
      paidScope: 'own',
    });

    expect(first.cashPaidByMeCents).toBe(5000);
    expect(first.cashPaidByPersonCents).toBe(3000);
    expect(second.cashPaidByPersonCents).toBe(2000);
  });

  it('only the payer gets a payable when another participant paid the total', () => {
    const entries = buildPurchaseEntries(
      {
        key: 'record-1',
        source: 'record',
        ownerId: 10,
        recordId: 10,
        groupId: 1,
        label: 'Groceries',
        date: 1000,
        totalCents: 10000,
        ownCents: 5000,
        sharedCents: 5000,
        paidByPersonId: 2,
        paidScope: 'full',
      },
      [
        { personId: 1, sharePercent: 30, shareCents: 3000 },
        { personId: 2, sharePercent: 20, shareCents: 2000 },
      ]
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].personId).toBe(2);
    expect(entries[0].balanceDeltaCents).toBe(-5000);
    expect(entries[0].cashPaidByPersonCents).toBe(10000);
  });

  it('creates one receivable per participant when the user paid', () => {
    const entries = buildPurchaseEntries(
      {
        key: 'record-1',
        source: 'record',
        ownerId: 10,
        recordId: 10,
        groupId: 1,
        label: 'Groceries',
        date: 1000,
        totalCents: 10000,
        ownCents: 5000,
        sharedCents: 5000,
        paidByPersonId: null,
        paidScope: 'full',
      },
      [
        { personId: 1, sharePercent: 30, shareCents: 3000 },
        { personId: 2, sharePercent: 20, shareCents: 2000 },
      ]
    );

    expect(entries.map((entry) => entry.personId)).toEqual([1, 2]);
    expect(entries.reduce((total, entry) => total + entry.balanceDeltaCents, 0)).toBe(5000);
  });

  it('summarizes totals and net balance', () => {    const entries: PersonStatementEntry[] = [
      buildPurchaseEntry(basePurchase),
      buildPurchaseEntry({
        ...basePurchase,
        key: 'record-2-person-1',
        recordId: 11,
        paidByPersonId: 1,
        totalCents: 4000,
        ownCents: 2000,
        sharedCents: 2000,
        personShareCents: 2000,
      }),
      buildSettlementEntry({
        key: 'settlement-1',
        personId: 1,
        date: 2000,
        amountCents: 1000,
        direction: 'they_paid_me',
      }),
    ];
    const summary = summarizePersonStatement(entries);

    expect(summary.purchasePaidByMeCents).toBe(10000);
    expect(summary.purchasePaidByPersonCents).toBe(4000);
    expect(summary.settlementsPaidByPersonCents).toBe(1000);
    expect(summary.theyOweMeCents).toBe(5000);
    expect(summary.iOweThemCents).toBe(2000);
    expect(summary.balanceCents).toBe(2000);
    expect(summary.entryCount).toBe(3);
  });

  it('groups entries by person and sorts newest first', () => {
    const statements = buildPersonStatements([
      buildPurchaseEntry({ ...basePurchase, date: 1000 }),
      buildPurchaseEntry({ ...basePurchase, key: 'newer', date: 3000 }),
    ]);

    const statement = statements.get(1);
    expect(statement?.entries.map((entry) => entry.date)).toEqual([3000, 1000]);
    expect(statement?.summary.personId).toBe(1);
  });

  it('financing entries never affect the balance or cash', () => {
    const entry = buildFinancingEntry({
      key: 'financing-1',
      personId: 1,
      ownerId: 3,
      recordId: 4,
      label: 'Car payment',
      date: 1000,
      amountCents: 8000,
      sharePercent: 50,
    });

    expect(entry.balanceDeltaCents).toBe(0);
    expect(entry.cashPaidByMeCents).toBe(0);
    expect(entry.cashPaidByPersonCents).toBe(0);
    expect(entry.kind).toBe('financing');
  });

  it('reports the balance direction', () => {
    expect(getBalanceDirection(100)).toBe('inYourFavor');
    expect(getBalanceDirection(-100)).toBe('inTheirFavor');
    expect(getBalanceDirection(0)).toBe('settled');
  });

  it('computes pending balances up to a cut-off', () => {
    const entries = [
      buildPurchaseEntry({ ...basePurchase, date: 1000 }),
      buildPurchaseEntry({ ...basePurchase, key: 'future', date: 4000 }),
      buildSettlementEntry({
        key: 'settlement',
        personId: 1,
        date: 2000,
        amountCents: 2000,
        direction: 'they_paid_me',
      }),
    ];

    expect(pendingBalancesAsOf(entries, 3000)).toEqual([
      { personId: 1, balanceCents: 3000 },
    ]);
  });

  it('builds a settlement that clears the balance in the right direction', () => {
    const owed = buildSettlementForBalance({
      personId: 1,
      balanceCents: 5000,
      groupId: 2,
      date: 100,
    });
    expect(owed.direction).toBe('they_paid_me');
    expect(owed.amountCents).toBe(5000);

    const debt = buildSettlementForBalance({
      personId: 1,
      balanceCents: -5000,
      groupId: 2,
      date: 100,
    });
    expect(debt.direction).toBe('i_paid_them');
    expect(debt.amountCents).toBe(5000);
  });
});
