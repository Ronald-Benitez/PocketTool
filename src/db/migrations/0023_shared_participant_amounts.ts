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
  const table = APP_SCHEMA.SharedExpenseParticipants.sqlName;

  await addColumnIfMissing(db, table, 'share_mode', "TEXT NOT NULL DEFAULT 'percent'");
  await addColumnIfMissing(db, table, 'share_amount_cents', 'INTEGER');

  await db.execAsync(`
    UPDATE ${quoteIdent(table)}
    SET share_mode = COALESCE(share_mode, 'percent');
  `);
};

export default {
  version: 23,
  name: '0023_shared_participant_amounts',
  up,
};
