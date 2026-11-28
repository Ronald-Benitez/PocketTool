export type ReceiptBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ReceiptLine = {
  text: string;
  boundingBox?: ReceiptBox;
};

export type ReceiptBlock = {
  lines?: ReceiptLine[];
};

export type ReceiptWarning =
  | 'NO_ITEMS'
  | 'TOTAL_MISSING'
  | 'TOTAL_MISMATCH'
  | 'UNPRICED_ITEMS';

export type ReceiptItem = {
  name: string;
  priceCents: number | null;
  quantity: number | null;
  unit: string | null;
  taxFlag: 'G' | 'E' | null;
  raw: string[];
};

export type ReceiptScan = {
  merchant: string | null;
  date: number | null;
  totalCents: number | null;
  items: ReceiptItem[];
  warnings: ReceiptWarning[];
};

type PendingItem = ReceiptItem;

const PRICE_AT_END =
  /(?:\$)?\s*(\d{1,3}(?:[.,]\d{3})*|\d+)[.,](\d{2})\s*([GE])?\s*$/i;
const QUANTITY_ROW =
  /^\s*(\d+(?:[.,]\d+)?)\s*UN\.?\s*X\s*\$?\s*(\d+(?:[.,]\d+)?)/i;
const WEIGHT_ROW =
  /^\s*(\d+(?:[.,]\d+)?)\s*(lb|lbs|kg)\s*A\s*(\d+(?:[.,]\d+)?)\s*\/\s*(lb|lbs|kg)/i;
const EQUIVALENT_ROW =
  /^\s*Equivalente\s+(\d+(?:[.,]\d+)?)\s*(kg|lb|lbs)/i;
const DATE_ROW = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
const IGNORE_ROW =
  /^(SUBTOTAL|TOTAL|IVA|CAMBIO|TARJ|AUTORIZA|REFERENCIA|CTA|TDA#|OP#|NOMBRE|NIT|NRC|C[OÓ]DIGO|N[UÚ]MERO|SELLO|DTE|VEINTICUATRO|SON|COND|MODELO|TIPO|COBRA|ESCANEA|PARTICIPA|GRACIAS|S\.A\.C\.|CORREO|VERSI[OÓ]N|G\s*=|E\s*=|#\s*ART|EFECTIVO|TARJETA|CARD|TC#)/i;
const MERCHANT_EXCLUDE =
  /S\.?A\.?|C\.?V\.?|NIT|NRC|ACTIVIDAD|VENTA|C[OÓ]DIGO|N[UÚ]MERO|SELLO|DTE|CALLE|CENTRO|SAN SALVADOR|SUPERMERCADO/i;

const normalizeOcr = (value: string) =>
  value
    .replace(/\b1b\b/gi, 'lb')
    .replace(/\bk9\b/gi, 'kg')
    .replace(/\s+/g, ' ')
    .trim();

const toNumber = (value: string): number => {
  const normalized = value.replace(/\s/g, '');
  if (normalized.includes('.') && normalized.includes(',')) {
    return Number(normalized.replace(/,/g, ''));
  }
  return Number(normalized.replace(',', '.'));
};

const toCents = (whole: string, decimals: string): number =>
  Math.round(Number(`${whole.replace(/[.,]/g, '')}.${decimals}`) * 100);

const stripTrailingCode = (value: string): string => {
  const parts = value.split(/\s+/).filter(Boolean);
  while (parts.length > 1 && /^\d{4,}$/.test(parts[parts.length - 1] ?? '')) {
    parts.pop();
  }
  return parts.join(' ').trim();
};

const extractPrice = (row: string) => {
  const match = row.match(PRICE_AT_END);
  if (!match) {
    return { priceCents: null, taxFlag: null, rest: row };
  }
  const priceCents = toCents(match[1] ?? '0', match[2] ?? '00');
  const taxFlag = (match[3]?.toUpperCase() as 'G' | 'E' | undefined) ?? null;
  return {
    priceCents,
    taxFlag,
    rest: row.slice(0, match.index ?? row.length),
  };
};

const cleanItemName = (value: string): string =>
  stripTrailingCode(
    value
      .replace(/\s+[GE]\s*$/i, '')
      .replace(/^[\s\-*]+|[\s\-*]+$/g, '')
      .replace(/\s+/g, ' ')
  ).trim();

const isIgnoredRow = (row: string): boolean => {
  const text = row.trim();
  if (!text) return true;
  if (IGNORE_ROW.test(text)) return true;
  if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(text)) return true;
  return false;
};

const createItem = (row: string): PendingItem | null => {
  const { priceCents, taxFlag, rest } = extractPrice(row);
  const name = cleanItemName(rest);
  if (name.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '').length < 2) {
    return null;
  }
  return {
    name,
    priceCents,
    quantity: null,
    unit: null,
    taxFlag,
    raw: [row],
  };
};

const attachQuantity = (item: PendingItem, row: string): boolean => {
  const quantityMatch = row.match(QUANTITY_ROW);
  if (!quantityMatch) return false;

  const quantity = toNumber(quantityMatch[1] ?? '1');
  const unitPrice = toNumber(quantityMatch[2] ?? '0');
  const priceTokens = row.match(/\$?\s*\d+[.,]\d{2}/g) ?? [];
  const linePrice =
    priceTokens.length >= 2 ? extractPrice(row).priceCents : null;
  item.quantity = Number.isFinite(quantity) ? quantity : null;
  item.unit = 'unit';
  item.priceCents =
    linePrice ??
    (Number.isFinite(quantity) && Number.isFinite(unitPrice)
      ? Math.round(quantity * unitPrice * 100)
      : null);
  item.raw.push(row);
  return true;
};

const attachWeight = (item: PendingItem, row: string): boolean => {
  const weightMatch = row.match(WEIGHT_ROW);
  if (!weightMatch) return false;

  const quantity = toNumber(weightMatch[1] ?? '1');
  const unit = (weightMatch[2] ?? 'lb').toLowerCase().replace(/s$/, '');
  const unitPrice = toNumber(weightMatch[3] ?? '0');
  const priceUnit = (weightMatch[4] ?? unit).toLowerCase().replace(/s$/, '');
  const { priceCents, taxFlag } = extractPrice(row);
  item.quantity = Number.isFinite(quantity) ? quantity : null;
  item.unit = unit;
  item.priceCents =
    priceCents ??
    (unit === priceUnit &&
    Number.isFinite(quantity) &&
    Number.isFinite(unitPrice)
      ? Math.round(quantity * unitPrice * 100)
      : null);
  if (taxFlag) item.taxFlag = taxFlag;
  item.raw.push(row);
  return true;
};

const attachEquivalent = (item: PendingItem, row: string): boolean => {
  const match = row.match(EQUIVALENT_ROW);
  if (!match) return false;

  const quantity = toNumber(match[1] ?? '0');
  item.quantity = Number.isFinite(quantity) ? quantity : item.quantity;
  item.unit = (match[2] ?? 'kg').toLowerCase().replace(/s$/, '');
  const { priceCents, taxFlag } = extractPrice(row);
  if (priceCents != null) item.priceCents = priceCents;
  if (taxFlag) item.taxFlag = taxFlag;
  item.raw.push(row);
  return true;
};

const findMerchant = (rows: string[], nameIndex: number): string | null => {
  const header = rows.slice(0, nameIndex >= 0 ? nameIndex : rows.length);
  for (let index = 0; index < header.length; index += 1) {
    const row = header[index]?.trim() ?? '';
    if (index === 0) continue;
    if (!/[A-Za-zÁÉÍÓÚÑ]{3}/.test(row)) continue;
    if (MERCHANT_EXCLUDE.test(row)) continue;
    if (row.length > 48) continue;
    return row;
  }
  return null;
};

const findDate = (rows: string[]): number | null => {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const match = rows[index]?.match(DATE_ROW);
    if (!match) continue;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (year < 2000 || year > 2100) continue;
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date.getTime();
    }
  }
  return null;
};

const findTotal = (rows: string[]): number | null => {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]?.trim() ?? '';
    if (!/^TOTAL\b/i.test(row)) continue;
    const { priceCents } = extractPrice(row);
    if (priceCents != null) return priceCents;
    const next = rows[index + 1]?.trim() ?? '';
    const nextPrice = extractPrice(next).priceCents;
    if (nextPrice != null) return nextPrice;
  }
  return null;
};

export const buildReceiptRows = (blocks: ReceiptBlock[]): string[] => {
  const lines: (ReceiptLine & { centerY: number })[] = [];

  for (const block of blocks) {
    for (const line of block.lines ?? []) {
      const text = normalizeOcr(line.text ?? '');
      if (!text) continue;
      const box = line.boundingBox;
      if (
        box &&
        Number.isFinite(box.y) &&
        Number.isFinite(box.height) &&
        Number.isFinite(box.x)
      ) {
        lines.push({ ...line, text, centerY: box.y + box.height / 2 });
      } else {
        lines.push({ text, centerY: lines.length * 1_000_000 });
      }
    }
  }

  if (lines.length === 0) return [];

  lines.sort((a, b) => a.centerY - b.centerY);
  const rows: { centerY: number; height: number; lines: typeof lines }[] = [];

  for (const line of lines) {
    const height = line.boundingBox?.height ?? 12;
    const tolerance = Math.max(8, height * 0.6);
    const row = rows.find(
      (candidate) => Math.abs(candidate.centerY - line.centerY) <= tolerance
    );
    if (row) {
      row.lines.push(line);
      row.centerY =
        (row.centerY * (row.lines.length - 1) + line.centerY) /
        row.lines.length;
      row.height = Math.max(row.height, height);
    } else {
      rows.push({ centerY: line.centerY, height, lines: [line] });
    }
  }

  return rows
    .map((row) =>
      row.lines
        .sort(
          (a, b) =>
            (a.boundingBox?.x ?? 0) - (b.boundingBox?.x ?? 0) ||
            (a.boundingBox?.y ?? 0) - (b.boundingBox?.y ?? 0)
        )
        .map((line) => line.text)
        .join('  ')
    )
    .filter(Boolean);
};

export const parseReceiptRows = (rows: string[]): ReceiptScan => {
  const normalizedRows = rows.map(normalizeOcr).filter(Boolean);
  const nameIndex = normalizedRows.findIndex((row) =>
    /^NOMBRE\b/i.test(row)
  );
  const start = nameIndex >= 0 ? nameIndex + 1 : 0;
  const end = normalizedRows.findIndex(
    (row, index) => index >= start && /^(SUBTOTAL|TOTAL)\b/i.test(row)
  );
  const itemRows = normalizedRows.slice(
    start,
    end === -1 ? normalizedRows.length : end
  );

  const items: ReceiptItem[] = [];
  let pending: PendingItem | null = null;
  const flush = () => {
    if (pending) {
      items.push(pending);
      pending = null;
    }
  };

  for (const row of itemRows) {
    if (isIgnoredRow(row)) continue;

    if (pending && attachEquivalent(pending, row)) continue;
    if (pending && attachQuantity(pending, row)) continue;
    if (pending && attachWeight(pending, row)) continue;

    const item = createItem(row);
    if (!item) {
      if (pending) {
        const { priceCents } = extractPrice(row);
        if (priceCents != null && pending.priceCents == null) {
          pending.priceCents = priceCents;
          pending.raw.push(row);
        }
      }
      continue;
    }

    flush();
    pending = item;
  }

  flush();

  const filteredItems = items.filter(
    (item) => item.name.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '').length >= 2
  );
  const totalCents = findTotal(normalizedRows);
  const calculatedTotal = filteredItems.reduce(
    (total, item) => total + (item.priceCents ?? 0),
    0
  );
  const warnings: ReceiptWarning[] = [];

  if (filteredItems.length === 0) warnings.push('NO_ITEMS');
  if (totalCents == null) warnings.push('TOTAL_MISSING');
  else if (Math.abs(calculatedTotal - totalCents) > 1) {
    warnings.push('TOTAL_MISMATCH');
  }
  if (filteredItems.some((item) => item.priceCents == null)) {
    warnings.push('UNPRICED_ITEMS');
  }

  return {
    merchant: findMerchant(normalizedRows, nameIndex),
    date: findDate(normalizedRows),
    totalCents,
    items: filteredItems,
    warnings,
  };
};

export const parseReceiptBlocks = (blocks: ReceiptBlock[]): ReceiptScan =>
  parseReceiptRows(buildReceiptRows(blocks));

export const parseReceiptText = (text: string): ReceiptScan =>
  parseReceiptRows(text.split(/\r?\n/));
