import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createIndexSql, quoteIdent } from '../schema/sql';

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
  const table = APP_SCHEMA.Groups.sqlName;

  await addColumnIfMissing(db, table, 'period_start', 'INTEGER');
  await addColumnIfMissing(db, table, 'period_end', 'INTEGER');
  await addColumnIfMissing(
    db,
    table,
    'period_mode',
    "TEXT NOT NULL DEFAULT 'calendar_month'"
  );

  await db.execAsync(`
    UPDATE ${quoteIdent(table)}
    SET period_mode = COALESCE(period_mode, 'calendar_month');

    -- The seed used to store a 1-based month for its sample group. Normalize
    -- only that identifiable row (default name and goal) before the generic
    -- out-of-range fix.
    UPDATE ${quoteIdent(table)}
    SET month = month - 1
    WHERE group_name = 'Default Group'
      AND goal = 500000
      AND month BETWEEN 1 AND 12;

    -- A value of 12 cannot be a zero-based month, so it is safe to normalize
    -- the remaining rows.
    UPDATE ${quoteIdent(table)}
    SET month = month - 1
    WHERE month = 12;
  `);

  for (const sql of createIndexSql(APP_SCHEMA.Groups)) {
    await db.execAsync(sql);
  }
};

export default {
  version: 25,
  name: '0025_group_periods',
  up,
};
