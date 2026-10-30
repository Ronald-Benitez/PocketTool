import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import {
  createIndexSql,
  createTableSql,
  createTimestampTriggerSql,
  quoteIdent,
} from '../schema/sql';

const tableExists = async (db: SQLiteDatabase, name: string) => {
  const row = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND lower(name) = lower(?)`,
    [name]
  );
  return row?.name ?? null;
};

const hasColumn = async (db: SQLiteDatabase, table: string, column: string) => {
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${quoteIdent(table)})`
  );
  return columns.some((item) => item.name === column);
};

/**
 * The plan status (draft/active/closed) never had functional effects, so it was
 * removed from the model. Existing databases may still carry the column.
 */
const up = async (db: SQLiteDatabase) => {
  const table = await tableExists(db, APP_SCHEMA.BudgetPlans.sqlName);
  if (!table) return;
  if (!(await hasColumn(db, table, 'status'))) return;

  try {
    await db.execAsync(`ALTER TABLE ${quoteIdent(table)} DROP COLUMN "status";`);
  } catch {
    // Older SQLite builds do not support DROP COLUMN. Rebuild the table with
    // the current schema and copy every remaining column.
    const legacyName = '__legacy_budget_plans_status';
    let source = await tableExists(db, legacyName);
    if (!source) {
      await db.execAsync(`ALTER TABLE ${quoteIdent(table)} RENAME TO ${quoteIdent(legacyName)};`);
      source = legacyName;
    }

    await db.execAsync(createTableSql(APP_SCHEMA.BudgetPlans));

    const columns = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(${quoteIdent(source)})`
    );
    const targetColumns = new Set(
      APP_SCHEMA.BudgetPlans.columns.map((column) => column.name)
    );
    const copyable = columns
      .filter((column) => targetColumns.has(column.name))
      .map((column) => quoteIdent(column.name));
    if (copyable.length > 0) {
      await db.execAsync(
        `INSERT INTO ${quoteIdent(table)} (${copyable.join(', ')})
         SELECT ${copyable.join(', ')} FROM ${quoteIdent(source)};`
      );
    }
    await db.execAsync(`DROP TABLE ${quoteIdent(source)};`);
    for (const sql of createIndexSql(APP_SCHEMA.BudgetPlans)) {
      await db.execAsync(sql);
    }
    for (const sql of createTimestampTriggerSql(APP_SCHEMA.BudgetPlans)) {
      await db.execAsync(sql);
    }
  }
};

export default {
  version: 6,
  name: '0006_drop_budget_plan_status',
  up,
};
