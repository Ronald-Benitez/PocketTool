export type SavingLinkedRecord = {
  saving_id?: number | null;
};

/**
 * Records paid from a saving are kept for history but must not count as
 * expenses of the month: the money left the saving, not the monthly cash.
 */
export const isMonthlyCashRecord = (record: SavingLinkedRecord) =>
  record.saving_id == null;
