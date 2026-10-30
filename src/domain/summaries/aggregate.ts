export type RecordTypeEffect = {
  id?: number;
  effect?: string | null;
};

export type RecordForBalance = {
  amount: number;
  record_type_id?: number | null;
};

export const getEffectMap = (recordTypes: RecordTypeEffect[]) =>
  new Map(
    recordTypes.flatMap((type) =>
      type.id === undefined ? [] : [[type.id, type.effect ?? ''] as const]
    )
  );

export const getSpendingTypeIds = (
  recordTypes: RecordTypeEffect[],
  excludedTypeIds: number[] = []
) => {
  const excluded = new Set(excludedTypeIds);
  return new Set(
    recordTypes.flatMap((type) =>
      type.id !== undefined &&
      !excluded.has(type.id) &&
      (type.effect === '+' || type.effect === '-')
        ? [type.id]
        : []
    )
  );
};

export const calculateRecordBalance = (
  records: RecordForBalance[],
  effectMap: Map<number, string>,
  allowedTypeIds: Set<number>
) =>
  records.reduce((balance, record) => {
    if (record.record_type_id == null || !allowedTypeIds.has(record.record_type_id)) {
      return balance;
    }
    const effect = effectMap.get(record.record_type_id);
    if (effect === '+') return balance + record.amount;
    if (effect === '-') return balance - record.amount;
    return balance;
  }, 0);
