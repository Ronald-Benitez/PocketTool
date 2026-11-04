import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { quoteIdent } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  const table = APP_SCHEMA.Records.sqlName;
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${quoteIdent(table)})`
  );
  const names = new Set(columns.map((column) => column.name));

  if (!names.has('own_amount_cents')) {
    await db.execAsync(
      `ALTER TABLE ${quoteIdent(table)} ADD COLUMN ${quoteIdent('own_amount_cents')} INTEGER;`
    );
  }
  if (!names.has('shared_amount_cents')) {
    await db.execAsync(
      `ALTER TABLE ${quoteIdent(table)} ADD COLUMN ${quoteIdent('shared_amount_cents')} INTEGER;`
    );
  }

  await db.execAsync(`
    UPDATE ${quoteIdent(table)}
    SET own_amount_cents = amount
    WHERE own_amount_cents IS NULL;

    UPDATE ${quoteIdent(table)}
    SET shared_amount_cents = 0
    WHERE shared_amount_cents IS NULL;
  `);
};

export default {
  version: 15,
  name: '0015_records_shared_amounts',
  up,
};
