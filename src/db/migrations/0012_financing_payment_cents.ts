import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { quoteIdent } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  const table = APP_SCHEMA.Financings.sqlName;
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${quoteIdent(table)})`
  );
  if (columns.some((column) => column.name === 'payment_cents')) return;

  await db.execAsync(
    `ALTER TABLE ${quoteIdent(table)} ADD COLUMN ${quoteIdent('payment_cents')} INTEGER;`
  );
};

export default {
  version: 12,
  name: '0012_financing_payment_cents',
  up,
};
