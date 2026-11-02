import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createTableSql, quoteIdent } from '../schema/sql';

const tableExists = async (db: SQLiteDatabase, name: string) => {
  const row = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND lower(name) = lower(?)`,
    [name]
  );
  return row?.name ?? null;
};

const columnsOf = async (db: SQLiteDatabase, table: string) =>
  db.getAllAsync<{ name: string }>(`PRAGMA table_info(${quoteIdent(table)})`);

const ensureColumns = async (
  db: SQLiteDatabase,
  table: string,
  columns: { name: string; sql: string }[]
) => {
  const existing = await columnsOf(db, table);
  const names = new Set(existing.map((column) => column.name));
  for (const column of columns) {
    if (names.has(column.name)) continue;
    await db.execAsync(
      `ALTER TABLE ${quoteIdent(table)} ADD COLUMN ${quoteIdent(column.name)} ${column.sql};`
    );
  }
};

const up = async (db: SQLiteDatabase) => {
  const paymentMethods = APP_SCHEMA.PaymentMethods.sqlName;
  const exists = await tableExists(db, paymentMethods);

  if (exists) {
    await ensureColumns(db, paymentMethods, [
      {
        name: 'is_credit_card',
        sql: 'INTEGER NOT NULL DEFAULT 0',
      },
      { name: 'credit_limit', sql: 'INTEGER' },
      {
        name: 'visual_kind',
        sql: "TEXT NOT NULL DEFAULT 'other'",
      },
      { name: 'card_brand', sql: 'TEXT' },
      { name: 'card_style', sql: 'TEXT' },
      { name: 'card_color', sql: 'TEXT' },
      { name: 'card_last4', sql: 'TEXT' },
      { name: 'card_holder', sql: 'TEXT' },
      { name: 'card_issuer', sql: 'TEXT' },
    ]);

    await db.execAsync(`
      UPDATE ${quoteIdent(paymentMethods)}
      SET is_credit_card = 1
      WHERE closing_date IS NOT NULL AND closing_date > 0;

      UPDATE ${quoteIdent(paymentMethods)}
      SET visual_kind = CASE
        WHEN is_credit_card = 1 THEN 'credit_card'
        WHEN payment_date IS NOT NULL AND payment_date > 0 THEN 'debit_card'
        ELSE 'other'
      END
      WHERE visual_kind IS NULL OR visual_kind = 'other';

      UPDATE ${quoteIdent(paymentMethods)}
      SET card_color = (
        SELECT pt.payment_color
        FROM ${quoteIdent(APP_SCHEMA.PaymentTypes.sqlName)} AS pt
        WHERE pt.id = ${quoteIdent(paymentMethods)}.payment_type_id
      )
      WHERE card_color IS NULL;
    `);
  }

  for (const table of [
    APP_SCHEMA.Financings,
    APP_SCHEMA.FinancingPayments,
    APP_SCHEMA.FinancingAdjustments,
  ]) {
    await db.execAsync(createTableSql(table));
  }
};

export default {
  version: 11,
  name: '0011_credit_cards_and_financings',
  up,
};
