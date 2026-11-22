export type ShoppingTotalItem = {
  priceCents: number | null;
  isChecked: boolean;
};

export type ShoppingTotal = {
  totalCents: number;
  checkedCount: number;
  pricedCheckedCount: number;
  unpricedCheckedCount: number;
  isPartial: boolean;
};

/**
 * Totals a shopping list using only checked items that have a price.
 *
 * A price of zero or less means the item has no price. It does not add to the
 * total, but it is counted so the UI can mark the total as partial. The check
 * state is stored, not derived.
 */
export const calculateShoppingTotal = (
  items: ShoppingTotalItem[]
): ShoppingTotal => {
  let totalCents = 0;
  let checkedCount = 0;
  let pricedCheckedCount = 0;
  let unpricedCheckedCount = 0;

  for (const item of items) {
    if (!item.isChecked) continue;
    checkedCount += 1;

    if (
      item.priceCents == null ||
      !Number.isFinite(item.priceCents) ||
      item.priceCents <= 0
    ) {
      unpricedCheckedCount += 1;
      continue;
    }

    pricedCheckedCount += 1;
    totalCents += Math.round(item.priceCents);
  }

  return {
    totalCents,
    checkedCount,
    pricedCheckedCount,
    unpricedCheckedCount,
    isPartial: unpricedCheckedCount > 0,
  };
};
