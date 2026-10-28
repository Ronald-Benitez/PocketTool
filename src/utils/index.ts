export const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset);
};

export const parseMoneyToCents = (value: string | number): number => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 0;
    return Math.round(value * 100);
  }

  const trimmed = value.trim().replace(/\s/g, '').replace(/^\$/, '');
  if (!trimmed) return 0;

  // Accept both "1234,56" (decimal comma) and "1,234.56" / "1.234,56".
  const lastComma = trimmed.lastIndexOf(',');
  const lastDot = trimmed.lastIndexOf('.');
  const normalized = lastComma > lastDot
    ? trimmed.replace(/\./g, '').replace(/,/g, '.')
    : trimmed.replace(/,/g, '');

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
};

export const centsToInput = (cents: number | null | undefined): string => {
  const value = Number(cents ?? 0);
  if (!Number.isFinite(value)) return '0.00';
  return (value / 100).toFixed(2);
};

export const formatMoney = (cents: number | null | undefined): string => {
  const value = Number(cents ?? 0);
  if (!Number.isFinite(value)) return '0.00';
  return (value / 100).toFixed(2);
};

export const formatMoneyWithSymbol = (cents: number | null | undefined): string =>
  `$${formatMoney(cents)}`;

export const sumCents = (values: Array<number | null | undefined>): number =>
  values.reduce<number>((total, value) => total + (Number(value) || 0), 0);
