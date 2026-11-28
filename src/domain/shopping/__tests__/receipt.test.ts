/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';

import {
  buildReceiptRows,
  parseReceiptRows,
  parseReceiptText,
} from '../receipt';

const fixture = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'walmart-receipt-rows.txt'),
  'utf8'
);
const rows = fixture.split(/\r?\n/).filter((row) => row.trim().length > 0);

describe('parseReceiptRows', () => {
  const scan = parseReceiptRows(rows);

  it('extracts the items, prices and total from the Walmart receipt', () => {
    expect(scan.items).toHaveLength(11);
    expect(scan.items.map((item) => item.priceCents)).toEqual([
      165, 75, 330, 375, 240, 220, 565, 70, 145, 75, 230,
    ]);
    expect(scan.totalCents).toBe(2490);
    expect(scan.warnings).toEqual([]);
    expect(scan.merchant).toBe('WALMART ESCALON');
    expect(scan.date).not.toBeNull();
    expect(new Date(scan.date as number).getDate()).toBe(25);
    expect(new Date(scan.date as number).getMonth()).toBe(10);
  });

  it('attaches unit quantities to the previous item', () => {
    const calcetin = scan.items.find((item) =>
      item.name.startsWith('CALCETIN')
    );
    const helidos = scan.items.find((item) => item.name.startsWith('HELIDS'));

    expect(calcetin).toMatchObject({
      quantity: 3,
      unit: 'unit',
      priceCents: 375,
    });
    expect(helidos).toMatchObject({
      quantity: 2,
      unit: 'unit',
      priceCents: 220,
    });
  });

  it('attaches weights and uses the kilogram equivalent', () => {
    const musl = scan.items.find((item) => item.name.startsWith('MUSL PIER'));
    const brocoli = scan.items.find((item) => item.name.startsWith('BROCOLI'));

    expect(musl).toMatchObject({
      quantity: 1.424,
      unit: 'kg',
      priceCents: 565,
    });
    expect(brocoli).toMatchObject({
      quantity: 0.313,
      unit: 'kg',
      priceCents: 145,
    });
  });

  it('removes product codes without removing short name numbers', () => {
    const names = scan.items.map((item) => item.name);

    expect(names).toContain('YOGURT 6P');
    expect(names).toContain('ESCAROLA');
    expect(names).toContain('GUISQUIL');
    expect(names).toContain('MANZANA G');
    expect(names.some((name) => name.includes('7303'))).toBe(false);
    expect(names.some((name) => name.includes('7410062104975'))).toBe(false);
  });

  it('warns when the total is missing or does not match', () => {
    const missing = parseReceiptRows([
      'NOMBRE: Consumidor Final',
      'ITEM 1234 1.00 G',
    ]);
    expect(missing.totalCents).toBeNull();
    expect(missing.warnings).toContain('TOTAL_MISSING');

    const mismatch = parseReceiptRows([
      'NOMBRE: Consumidor Final',
      'ITEM 1234 1.00 G',
      'TOTAL $2.00',
    ]);
    expect(mismatch.totalCents).toBe(200);
    expect(mismatch.warnings).toContain('TOTAL_MISMATCH');
  });

  it('computes the line total when only the unit price is printed', () => {
    const scan = parseReceiptRows([
      'NOMBRE: Consumidor Final',
      'ITEM 1234',
      '2 UN. X $1.25',
      'TOTAL $2.50',
    ]);

    expect(scan.items[0]).toMatchObject({
      quantity: 2,
      unit: 'unit',
      priceCents: 250,
    });
    expect(scan.warnings).toEqual([]);
  });

  it('marks unpriced items', () => {
    const scan = parseReceiptRows([
      'NOMBRE: Consumidor Final',
      'ITEM 1234',
      'TOTAL $1.00',
    ]);

    expect(scan.items[0]).toMatchObject({ priceCents: null });
    expect(scan.warnings).toContain('UNPRICED_ITEMS');
  });

  it('returns NO_ITEMS for a text without items', () => {
    const scan = parseReceiptText(
      'NOMBRE: Consumidor Final\nSUBTOTAL $0.00\nTOTAL $0.00'
    );
    expect(scan.items).toHaveLength(0);
    expect(scan.warnings).toContain('NO_ITEMS');
  });
});

describe('buildReceiptRows', () => {
  it('groups lines by vertical center and sorts them left to right', () => {
    const rows = buildReceiptRows([
      {
        lines: [
          {
            text: 'YOGURT 6P',
            boundingBox: { x: 0, y: 0, width: 120, height: 20 },
          },
          {
            text: '1.65 G',
            boundingBox: { x: 300, y: 2, width: 60, height: 18 },
          },
          {
            text: 'GV BOLSA',
            boundingBox: { x: 0, y: 30, width: 100, height: 20 },
          },
        ],
      },
    ]);

    expect(rows).toEqual(['YOGURT 6P  1.65 G', 'GV BOLSA']);
  });

  it('keeps lines without boxes as separate rows', () => {
    const rows = buildReceiptRows([
      { lines: [{ text: 'YOGURT' }, { text: '1.65' }] },
    ]);
    expect(rows).toEqual(['YOGURT', '1.65']);
  });
});
