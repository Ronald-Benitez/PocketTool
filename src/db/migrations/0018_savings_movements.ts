import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { quoteIdent } from '../schema/sql';

const addColumnIfMissing = async (
  db: SQLiteDatabase,
  tableName: string,
  columnName: string,
  definition: string
) => {
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${quoteIdent(tableName)})`
  );
  if (columns.some((column) => column.name === columnName)) return;
  await db.execAsync(
    `ALTER TABLE ${quoteIdent(tableName)} ADD COLUMN ${quoteIdent(columnName)} ${definition};`
  );
};

const up = async (db: SQLiteDatabase) => {
  const table = APP_SCHEMA.SavingsHistory.sqlName;
  const now = Date.now();

  await addColumnIfMissing(db, table, 'person_id', 'INTEGER');
  await addColumnIfMissing(db, table, 'kind', "TEXT NOT NULL DEFAULT 'adjustment'");
  await addColumnIfMissing(db, table, 'amount_cents', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing(db, table, 'period_year', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing(db, table, 'period_month', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing(db, table, 'note', 'TEXT');
  await addColumnIfMissing(db, table, 'record_id', 'INTEGER');
  await addColumnIfMissing(db, table, 'group_id', 'INTEGER');
  await addColumnIfMissing(db, table, 'record_type_id', 'INTEGER');

  await db.execAsync(`
    UPDATE ${quoteIdent(table)}
    SET kind = CASE
          WHEN new_amount > previous_amount THEN 'deposit'
          WHEN new_amount < previous_amount THEN 'withdrawal'
          ELSE 'adjustment'
        END,
        amount_cents = ABS(new_amount - previous_amount),
        period_year = CAST(strftime('%Y', change_date / 1000, 'unixepoch') AS INTEGER),
        period_month = CAST(strftime('%m', change_date / 1000, 'unixepoch') AS INTEGER)
    WHERE kind = 'adjustment' AND amount_cents = 0;
  `);

  // Preserve the opening balance of savings created before movements existed.
  await db.execAsync(`
    INSERT INTO ${quoteIdent(table)}
      (savings_id, kind, amount_cents, previous_amount, new_amount, change_date,
       period_year, period_month)
    SELECT
      s.id,
      'initial',
      COALESCE((
        SELECT h.previous_amount
        FROM ${quoteIdent(table)} h
        WHERE h.savings_id = s.id AND h.deleted_at IS NULL
        ORDER BY h.change_date ASC
        LIMIT 1
      ), s.amount),
      0,
      COALESCE((
        SELECT h.previous_amount
        FROM ${quoteIdent(table)} h
        WHERE h.savings_id = s.id AND h.deleted_at IS NULL
        ORDER BY h.change_date ASC
        LIMIT 1
      ), s.amount),
      COALESCE(s.created_at, ${now}),
      CAST(strftime('%Y', COALESCE(s.created_at, ${now}) / 1000, 'unixepoch') AS INTEGER),
      CAST(strftime('%m', COALESCE(s.created_at, ${now}) / 1000, 'unixepoch') AS INTEGER)
    FROM ${quoteIdent(APP_SCHEMA.Savings.sqlName)} s
    WHERE s.deleted_at IS NULL
      AND s.amount > 0
      AND NOT EXISTS (
        SELECT 1 FROM ${quoteIdent(table)} h
        WHERE h.savings_id = s.id AND h.kind = 'initial' AND h.deleted_at IS NULL
      );
  `);
};

export default {
  version: 18,
  name: '0018_savings_movements',
  up,
};
