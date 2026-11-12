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
  const table = APP_SCHEMA.Records.sqlName;

  await addColumnIfMissing(
    db,
    table,
    'paid_by_person_id',
    `INTEGER REFERENCES ${quoteIdent(APP_SCHEMA.People.sqlName)}("id") ON DELETE SET NULL`
  );
  await addColumnIfMissing(db, table, 'paid_scope', "TEXT NOT NULL DEFAULT 'full'");

  await db.execAsync(`
    UPDATE ${quoteIdent(table)}
    SET paid_scope = COALESCE(paid_scope, 'full');

    CREATE INDEX IF NOT EXISTS ${quoteIdent('idx_records_paid_by')}
      ON ${quoteIdent(table)} (${quoteIdent('paid_by_person_id')})
      WHERE deleted_at IS NULL;
  `);
};

export default {
  version: 21,
  name: '0021_records_payer_and_scope',
  up,
};
