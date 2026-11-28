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
  const table = APP_SCHEMA.ShoppingListItems.sqlName;

  await addColumnIfMissing(db, table, 'quantity', 'REAL');
  await addColumnIfMissing(db, table, 'unit', 'TEXT');
};

export default {
  version: 28,
  name: '0028_shopping_item_quantities',
  up,
};
