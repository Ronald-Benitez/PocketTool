export type PaidScope = 'full' | 'own';
export type SettlementDirection = 'i_paid_them' | 'they_paid_me';
export type BalanceDirection = 'inYourFavor' | 'inTheirFavor' | 'settled';

export type PersonStatementEntryKind = 'purchase' | 'settlement' | 'financing';
export type PersonStatementSource =
  | 'record'
  | 'fixed'
  | 'financing'
  | 'settlement';

export type PersonStatementEntry = {
  key: string;
  kind: PersonStatementEntryKind;
  personId: number;
  source: PersonStatementSource;
  ownerId?: number | null;
  recordId?: number | null;
  groupId?: number | null;
  label: string;
  date: number;
  totalCents?: number | null;
  ownCents?: number | null;
  sharePercent?: number | null;
  shareCents?: number | null;
  paidByMe?: boolean | null;
  paidScope?: PaidScope | null;
  direction?: 'theyOweMe' | 'iOweThem' | null;
  settlementDirection?: SettlementDirection | null;
  /** Positive means the person owes the user. */
  balanceDeltaCents: number;
  cashPaidByMeCents: number;
  cashPaidByPersonCents: number;
};

export type PersonStatementSummary = {
  personId: number;
  paidByMeCents: number;
  paidByPersonCents: number;
  purchasePaidByMeCents: number;
  purchasePaidByPersonCents: number;
  settlementsPaidByMeCents: number;
  settlementsPaidByPersonCents: number;
  theyOweMeCents: number;
  iOweThemCents: number;
  balanceCents: number;
  entryCount: number;
};

export type PurchaseEntryInput = {
  key: string;
  personId: number;
  source: 'record' | 'fixed';
  ownerId: number;
  recordId: number;
  groupId?: number | null;
  label: string;
  date: number;
  totalCents: number;
  ownCents: number;
  sharedCents: number;
  personSharePercent: number;
  personShareCents: number;
  paidByPersonId: number | null;
  paidScope: PaidScope;
};

export type PurchaseBaseInput = Omit<
  PurchaseEntryInput,
  'personId' | 'personSharePercent' | 'personShareCents'
>;

export type PurchaseSplit = {
  personId: number;
  sharePercent: number;
  shareCents: number;
};

export type SettlementEntryInput = {
  key: string;
  personId: number;
  groupId?: number | null;
  date: number;
  amountCents: number;
  direction: SettlementDirection;
  notes?: string | null;
};

export type FinancingEntryInput = {
  key: string;
  personId: number;
  ownerId: number;
  recordId: number;
  label: string;
  date: number;
  amountCents: number;
  sharePercent: number;
};

const clampScope = (scope: PaidScope | null | undefined): PaidScope =>
  scope === 'own' ? 'own' : 'full';

export const buildPurchaseEntry = (
  input: PurchaseEntryInput
): PersonStatementEntry => {
  const totalCents = Math.max(0, input.totalCents);
  const ownCents = Math.max(0, input.ownCents);
  const personShareCents = Math.max(0, input.personShareCents);
  const scope = clampScope(input.paidScope);
  const paidByMe = input.paidByPersonId == null;

  let balanceDeltaCents = 0;
  let cashPaidByMeCents = 0;
  let cashPaidByPersonCents = 0;

  if (paidByMe) {
    if (scope === 'own') {
      cashPaidByMeCents = ownCents;
      cashPaidByPersonCents = personShareCents;
    } else {
      cashPaidByMeCents = totalCents;
      balanceDeltaCents = personShareCents;
    }
  } else if (scope === 'own') {
    cashPaidByMeCents = ownCents;
    cashPaidByPersonCents = personShareCents;
  } else {
    cashPaidByPersonCents = totalCents;
    balanceDeltaCents = -ownCents;
  }

  return {
    key: input.key,
    kind: 'purchase',
    personId: input.personId,
    source: input.source,
    ownerId: input.ownerId,
    recordId: input.recordId,
    groupId: input.groupId ?? null,
    label: input.label,
    date: input.date,
    totalCents,
    ownCents,
    sharePercent: input.personSharePercent,
    shareCents: personShareCents,
    paidByMe,
    paidScope: scope,
    direction:
      balanceDeltaCents > 0
        ? 'theyOweMe'
        : balanceDeltaCents < 0
          ? 'iOweThem'
          : null,
    balanceDeltaCents,
    cashPaidByMeCents,
    cashPaidByPersonCents,
  };
};

/**
 * Builds the statement entries of a purchase. When the user paid, every
 * participant has a receivable. When another participant paid the total, only
 * that participant has a payable with the user; the other participants settle
 * directly with the payer and must not appear in the user's statement.
 */
export const buildPurchaseEntries = (
  input: PurchaseBaseInput,
  splits: PurchaseSplit[]
): PersonStatementEntry[] => {
  if (input.paidByPersonId != null) {
    const payer = splits.find(
      (split) => split.personId === input.paidByPersonId
    );
    return [
      buildPurchaseEntry({
        ...input,
        key: `${input.key}-${input.paidByPersonId}`,
        personId: input.paidByPersonId,
        personSharePercent: payer?.sharePercent ?? 0,
        personShareCents: payer?.shareCents ?? 0,
      }),
    ];
  }

  return splits
    .filter((split) => split.shareCents > 0)
    .map((split) =>
      buildPurchaseEntry({
        ...input,
        key: `${input.key}-${split.personId}`,
        personId: split.personId,
        personSharePercent: split.sharePercent,
        personShareCents: split.shareCents,
      })
    );
};

export const buildSettlementEntry = (
  input: SettlementEntryInput
): PersonStatementEntry => {
  const amountCents = Math.max(0, input.amountCents);
  return {
    key: input.key,
    kind: 'settlement',
    personId: input.personId,
    source: 'settlement',
    groupId: input.groupId ?? null,
    label: input.notes?.trim() || '',
    date: input.date,
    totalCents: amountCents,
    settlementDirection: input.direction,
    balanceDeltaCents:
      input.direction === 'i_paid_them' ? amountCents : -amountCents,
    cashPaidByMeCents: input.direction === 'i_paid_them' ? amountCents : 0,
    cashPaidByPersonCents:
      input.direction === 'they_paid_me' ? amountCents : 0,
  };
};

/**
 * Financing allocations are kept for history but never affect the new person
 * balance, as requested: they are shown as informational entries only.
 */
export const buildFinancingEntry = (
  input: FinancingEntryInput
): PersonStatementEntry => ({
  key: input.key,
  kind: 'financing',
  personId: input.personId,
  source: 'financing',
  ownerId: input.ownerId,
  recordId: input.recordId,
  label: input.label,
  date: input.date,
  sharePercent: input.sharePercent,
  shareCents: input.amountCents,
  balanceDeltaCents: 0,
  cashPaidByMeCents: 0,
  cashPaidByPersonCents: 0,
});

export const summarizePersonStatement = (
  entries: PersonStatementEntry[]
): PersonStatementSummary => {
  let paidByMeCents = 0;
  let paidByPersonCents = 0;
  let purchasePaidByMeCents = 0;
  let purchasePaidByPersonCents = 0;
  let settlementsPaidByMeCents = 0;
  let settlementsPaidByPersonCents = 0;
  let theyOweMeCents = 0;
  let iOweThemCents = 0;
  let balanceCents = 0;

  entries.forEach((entry) => {
    paidByMeCents += entry.cashPaidByMeCents;
    paidByPersonCents += entry.cashPaidByPersonCents;
    balanceCents += entry.balanceDeltaCents;

    if (entry.kind === 'purchase') {
      purchasePaidByMeCents += entry.cashPaidByMeCents;
      purchasePaidByPersonCents += entry.cashPaidByPersonCents;
      if (entry.balanceDeltaCents > 0) {
        theyOweMeCents += entry.balanceDeltaCents;
      } else if (entry.balanceDeltaCents < 0) {
        iOweThemCents += Math.abs(entry.balanceDeltaCents);
      }
    } else if (entry.kind === 'settlement') {
      settlementsPaidByMeCents += entry.cashPaidByMeCents;
      settlementsPaidByPersonCents += entry.cashPaidByPersonCents;
    }
  });

  return {
    personId: entries[0]?.personId ?? 0,
    paidByMeCents,
    paidByPersonCents,
    purchasePaidByMeCents,
    purchasePaidByPersonCents,
    settlementsPaidByMeCents,
    settlementsPaidByPersonCents,
    theyOweMeCents,
    iOweThemCents,
    balanceCents,
    entryCount: entries.length,
  };
};

export const buildPersonStatements = (
  entries: PersonStatementEntry[]
): Map<number, { summary: PersonStatementSummary; entries: PersonStatementEntry[] }> => {
  const grouped = new Map<number, PersonStatementEntry[]>();
  entries.forEach((entry) => {
    const current = grouped.get(entry.personId) ?? [];
    current.push(entry);
    grouped.set(entry.personId, current);
  });

  const result = new Map<
    number,
    { summary: PersonStatementSummary; entries: PersonStatementEntry[] }
  >();
  grouped.forEach((personEntries, personId) => {
    const sorted = [...personEntries].sort((left, right) => right.date - left.date);
    const summary = summarizePersonStatement(sorted);
    result.set(personId, { summary: { ...summary, personId }, entries: sorted });
  });
  return result;
};

export const getBalanceDirection = (
  balanceCents: number
): BalanceDirection => {
  if (balanceCents > 0) return 'inYourFavor';
  if (balanceCents < 0) return 'inTheirFavor';
  return 'settled';
};

export type PendingBalance = {
  personId: number;
  balanceCents: number;
};

/**
 * Balances accumulated up to `asOfDate`, used when a new group is created.
 * Entries after the cut-off are ignored so the previous group's pending
 * balance can be settled without mixing it with the new group.
 */
export const pendingBalancesAsOf = (
  entries: PersonStatementEntry[],
  asOfDate: number
): PendingBalance[] => {
  const totals = new Map<number, number>();
  entries.forEach((entry) => {
    if (entry.date > asOfDate) return;
    totals.set(
      entry.personId,
      (totals.get(entry.personId) ?? 0) + entry.balanceDeltaCents
    );
  });

  return [...totals.entries()]
    .map(([personId, balanceCents]) => ({ personId, balanceCents }))
    .filter((item) => item.balanceCents !== 0)
    .sort((left, right) => Math.abs(right.balanceCents) - Math.abs(left.balanceCents));
};

/**
 * A settlement that clears `balanceCents`: if the person owes the user they
 * pay (`they_paid_me`); if the user owes them, the user pays (`i_paid_them`).
 */
export const buildSettlementForBalance = ({
  personId,
  balanceCents,
  groupId = null,
  date,
  notes = null,
}: {
  personId: number;
  balanceCents: number;
  groupId?: number | null;
  date: number;
  notes?: string | null;
}): SettlementEntryInput & {
  amountCents: number;
  direction: SettlementDirection;
} => ({
  key: `pending-${personId}-${date}`,
  personId,
  groupId,
  date,
  amountCents: Math.abs(balanceCents),
  direction: balanceCents > 0 ? 'they_paid_me' : 'i_paid_them',
  notes,
});
