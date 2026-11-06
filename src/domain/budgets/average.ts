export type AverageSourceRecord = {
  amount: number;
  category_id?: number | null;
  record_type_id?: number | null;
};

export type AverageCategoryTotal = {
  categoryId: number;
  typeId: number;
  amountCents: number;
};

/**
 * Averages the spending of a category across a set of groups.
 *
 * Groups without a record for a category count as zero, so the result is the
 * expected monthly amount for the selected period rather than only the months
 * where the category appeared.
 */
export const averageBudgetTotals = (
  records: AverageSourceRecord[],
  budgetableTypeIds: Set<number>,
  groupCount: number
): AverageCategoryTotal[] => {
  if (groupCount <= 0) return [];

  const totals = new Map<string, { categoryId: number; typeId: number; amount: number }>();

  for (const record of records) {
    if (
      record.category_id == null ||
      record.record_type_id == null ||
      !budgetableTypeIds.has(record.record_type_id) ||
      record.amount <= 0
    ) {
      continue;
    }
    const key = `${record.category_id}:${record.record_type_id}`;
    const entry = totals.get(key) ?? {
      categoryId: record.category_id,
      typeId: record.record_type_id,
      amount: 0,
    };
    entry.amount += record.amount;
    totals.set(key, entry);
  }

  return [...totals.values()]
    .map((entry) => ({
      categoryId: entry.categoryId,
      typeId: entry.typeId,
      amountCents: Math.round(entry.amount / groupCount),
    }))
    .filter((entry) => entry.amountCents > 0);
};
