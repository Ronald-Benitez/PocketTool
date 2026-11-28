export const SHOPPING_UNITS = ['unit', 'kg', 'lb', 'l', 'ml', 'g'] as const;

export type ShoppingUnit = (typeof SHOPPING_UNITS)[number];

export const formatQuantity = (quantity: number): string => {
  if (!Number.isFinite(quantity)) return '';
  return String(Math.round(quantity * 1000) / 1000);
};

export const parseQuantityInput = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};
