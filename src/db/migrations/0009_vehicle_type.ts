import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { quoteIdent } from '../schema/sql';

const tableExists = async (db: SQLiteDatabase, name: string) => {
  const row = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND lower(name) = lower(?)`,
    [name]
  );
  return row?.name ?? null;
};

const up = async (db: SQLiteDatabase) => {
  const table = APP_SCHEMA.Vehicles;
  if (!(await tableExists(db, table.sqlName))) return;

  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${quoteIdent(table.sqlName)})`
  );
  if (columns.some((column) => column.name === 'vehicle_type')) return;

  await db.execAsync(
    `ALTER TABLE ${quoteIdent(table.sqlName)}
     ADD COLUMN ${quoteIdent('vehicle_type')} TEXT NOT NULL DEFAULT 'car';`
  );
};

export default {
  version: 9,
  name: '0009_vehicle_type',
  up,
};
