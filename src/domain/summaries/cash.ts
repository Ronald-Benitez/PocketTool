export type CashRecord = {
  amount: number;
  own_amount_cents?: number | null;
  shared_amount_cents?: number | null;
  paid_by_person_id?: number | null;
  paid_scope?: string | null;
  record_type_id?: number | null;
  saving_id?: number | null;
};

/**
 * Money that actually left the user's pocket for a record.
 *
 * - Unshared or shared paid by the user with `full` scope: the whole purchase.
 * - Fixed paid with `own` scope: only the user's share.
 * - Paid by another person: nothing.
 * - Paid from a saving: nothing (the money left the saving, not the month).
 */
export const getRecordPaidByMeCents = (record: CashRecord): number => {
  if (record.saving_id != null) return 0;
  const own = record.own_amount_cents ?? record.amount ?? 0;
  const shared = record.shared_amount_cents ?? 0;
  if (record.paid_by_person_id != null) return 0;
  if (record.paid_scope === 'own') return own;
  return own + shared;
};

/**
 * What other people owe the user for a shared purchase, gross and before
 * settlements. A purchase paid by another person (or where each side paid
 * their own share) does not create a receivable.
 */
export const getRecordReceivableCents = (record: CashRecord): number => {
  if (record.saving_id != null) return 0;
  if (record.paid_by_person_id != null) return 0;
  if (record.paid_scope === 'own') return 0;
  return record.shared_amount_cents ?? 0;
};

/**
 * Cash contribution of a record to the monthly buckets. Income adds the
 * received amount; expenses subtract what the user actually paid; transfers
 * do not affect the cash balance.
 */
export const getRecordCashCents = (
  record: CashRecord,
  effect: string | null | undefined
): number => {
  if (effect === '+') return record.own_amount_cents ?? record.amount ?? 0;
  if (effect === '-') return getRecordPaidByMeCents(record);
  return 0;
};

export type CashSettlement = {
  amount_cents: number;
  direction: string;
};

export const getSettlementsNetCents = (
  settlements: CashSettlement[]
): number =>
  settlements.reduce((total, settlement) => {
    if (settlement.direction === 'they_paid_me') {
      return total + settlement.amount_cents;
    }
    if (settlement.direction === 'i_paid_them') {
      return total - settlement.amount_cents;
    }
    return total;
  }, 0);
