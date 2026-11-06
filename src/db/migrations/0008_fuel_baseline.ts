import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createTableSql, quoteIdent } from '../schema/sql';

type ColumnInfo = {
  name: string;
  notnull: number;
};

const tableExists = async (db: SQLiteDatabase, name: string) => {
  const row = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND lower(name) = lower(?)`,
    [name]
  );
  return row?.name ?? null;
};

const columnsOf = async (db: SQLiteDatabase, table: string) =>
  db.getAllAsync<ColumnInfo>(`PRAGMA table_info(${quoteIdent(table)})`);

/**
 * Allows an odometer-only baseline entry and partial fills without odometer.
 * SQLite cannot drop NOT NULL constraints in place, so the table is rebuilt.
 */
const up = async (db: SQLiteDatabase) => {
  const table = APP_SCHEMA.VehicleFuelEntries;
  const exists = await tableExists(db, table.sqlName);
  if (!exists) return;

  const columns = await columnsOf(db, table.sqlName);
  const byName = new Map(columns.map((column) => [column.name, column]));
  const alreadyMigrated =
    byName.has('is_baseline') &&
    byName.get('volume')?.notnull === 0 &&
    byName.get('price_per_unit')?.notnull === 0 &&
    byName.get('total_cost')?.notnull === 0;
  if (alreadyMigrated) return;

  const legacy = `${table.sqlName}__baseline_old`;
  if (await tableExists(db, legacy)) {
    await db.execAsync(`DROP TABLE ${quoteIdent(legacy)};`);
  }

  await db.execAsync(
    `ALTER TABLE ${quoteIdent(table.sqlName)} RENAME TO ${quoteIdent(legacy)};`
  );
  await db.execAsync(createTableSql(table));

  const targetColumns = table.columns
    .map((column) => column.name)
    .filter((name) => name !== 'is_baseline' || byName.has(name));
  const columnList = targetColumns.map(quoteIdent).join(', ');
  const selectList = targetColumns.map(quoteIdent).join(', ');

  await db.execAsync(
    `INSERT INTO ${quoteIdent(table.sqlName)} (${columnList})
     SELECT ${selectList} FROM ${quoteIdent(legacy)};`
  );
  await db.execAsync(`DROP TABLE ${quoteIdent(legacy)};`);
};

export default {
  version: 8,
  name: '0008_fuel_baseline',
  up,
};
