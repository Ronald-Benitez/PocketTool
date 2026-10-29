import type { SQLiteDatabase } from 'expo-sqlite';

import {
  APP_SCHEMA,
  TABLE_NAMES,
  type TableDefinition,
  type TableName,
} from './tables';
import type { ColumnDefinition, ColumnKind } from '../types';
import { seedReferenceData } from './seed';
import {
  createIndexSql,
  createTableSql,
  createTimestampTriggerSql,
  escapeSqlString,
  quoteIdent,
} from './sql';

type ColumnInfo = {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
};

const columnKind = (table: TableName, columnName: string): ColumnKind | undefined =>
  APP_SCHEMA[table].columns.find((column) => column.name === columnName)?.kind;

const isMoneyColumn = (table: TableName, columnName: string) =>
  columnKind(table, columnName) === 'money';

const isTimestampColumn = (table: TableName, columnName: string) =>
  columnKind(table, columnName) === 'timestamp';

const findTable = async (db: SQLiteDatabase, name: string): Promise<string | null> => {
  const row = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND lower(name) = lower(?)`,
    [name]
  );
  return row?.name ?? null;
};

const getColumns = async (db: SQLiteDatabase, tableName: string): Promise<ColumnInfo[]> => {
  return db.getAllAsync<ColumnInfo>(`PRAGMA table_info(${quoteIdent(tableName)})`);
};

const defaultExpr = (column: ColumnDefinition) => {
  if (column.defaultValue !== undefined) {
    if (column.defaultValue === null) return 'NULL';
    if (typeof column.defaultValue === 'string') return escapeSqlString(column.defaultValue);
    return String(column.defaultValue);
  }
  if (column.notNull) {
    if (column.type === 'INTEGER' || column.type === 'REAL') return '0';
    if (column.type === 'TEXT') return "''";
  }
  return 'NULL';
};

const toTimestampExpr = (column: string) => {
  const q = quoteIdent(column);
  return `CASE
    WHEN ${q} IS NULL THEN NULL
    WHEN typeof(${q}) IN ('integer', 'real') THEN
      CASE
        WHEN ABS(CAST(${q} AS INTEGER)) < 100000000000 THEN CAST(${q} AS INTEGER) * 1000
        ELSE CAST(${q} AS INTEGER)
      END
    WHEN trim(CAST(${q} AS TEXT)) <> '' AND CAST(${q} AS TEXT) NOT GLOB '*[^0-9]*' THEN
      CASE
        WHEN ABS(CAST(${q} AS INTEGER)) < 100000000000 THEN CAST(${q} AS INTEGER) * 1000
        ELSE CAST(${q} AS INTEGER)
      END
    ELSE CAST(strftime('%s', ${q}) AS INTEGER) * 1000
  END`;
};

const toCentsExpr = (column: string, oldType: string, legacyName: boolean) => {
  const q = quoteIdent(column);
  const alreadyInteger = oldType.trim().toUpperCase() === 'INTEGER';
  if (!legacyName && alreadyInteger) {
    return `CAST(${q} AS INTEGER)`;
  }
  return `CAST(ROUND(CAST(${q} AS REAL) * 100) AS INTEGER)`;
};

const typeMatches = (oldType: string, desired: string) =>
  oldType.trim().toUpperCase() === desired.trim().toUpperCase();

const isConvertedColumn = (table: TableName, columnName: string) => {
  const kind = columnKind(table, columnName);
  return kind === 'money' || kind === 'timestamp';
};

const needsRebuild = async (db: SQLiteDatabase, table: TableDefinition): Promise<boolean> => {
  const actual = (await findTable(db, table.sqlName)) ?? (await findTable(db, table.name));
  if (!actual) return true;
  if (actual !== table.sqlName) return true;

  const oldColumns = await getColumns(db, actual);
  const byName = new Map(oldColumns.map((column) => [column.name.toLowerCase(), column]));

  for (const column of table.columns) {
    const old = byName.get(column.name.toLowerCase());
    if (!old) return true;
    if (isConvertedColumn(table.name as TableName, column.name) && !typeMatches(old.type, column.type)) {
      return true;
    }
  }

  return false;
};

const budgetTypeLookupExpr = (oldBudgetType: string) => {
  const q = quoteIdent(oldBudgetType);
  const recordTypes = APP_SCHEMA.RecordTypes.sqlName;
  return `(
    SELECT rt.id FROM ${quoteIdent(recordTypes)} AS rt
    WHERE lower(rt.type_name) = lower(
      CASE ${q}
        WHEN 'income' THEN 'Income'
        WHEN 'expense' THEN 'Expense'
        WHEN 'transfer' THEN 'Transfer'
        WHEN 'credit' THEN 'Credit expenses'
        ELSE ${q}
      END
    )
    LIMIT 1
  )`;
};

const paymentTypeLookupExpr = (oldPaymentType: string) => {
  const q = quoteIdent(oldPaymentType);
  const paymentTypes = APP_SCHEMA.PaymentTypes.sqlName;
  return `(
    SELECT pt.id FROM ${quoteIdent(paymentTypes)} AS pt
    WHERE lower(pt.payment_type_name) = lower(${q})
    LIMIT 1
  )`;
};

const copyColumnExpr = (
  table: TableDefinition,
  column: ColumnDefinition,
  oldColumns: Map<string, ColumnInfo>,
  legacyName: boolean
) => {
  const tableName = table.name as TableName;
  const old = oldColumns.get(column.name.toLowerCase());

  if (tableName === 'PaymentMethods' && column.name === 'payment_type_id') {
    const oldPaymentType = oldColumns.get('payment_type');
    const fallback = oldPaymentType
      ? oldPaymentType.type.trim().toUpperCase() === 'INTEGER'
        ? quoteIdent(oldPaymentType.name)
        : paymentTypeLookupExpr(oldPaymentType.name)
      : null;
    if (old && fallback) return `COALESCE(${quoteIdent(old.name)}, ${fallback})`;
    if (old) return quoteIdent(old.name);
    if (fallback) return fallback;
  }

  if (tableName === 'Budgets' && column.name === 'record_type_id') {
    const oldBudgetType = oldColumns.get('budget_type');
    const fallback = oldBudgetType
      ? oldBudgetType.type.trim().toUpperCase() === 'INTEGER'
        ? quoteIdent(oldBudgetType.name)
        : budgetTypeLookupExpr(oldBudgetType.name)
      : null;
    if (old && fallback) return `COALESCE(${quoteIdent(old.name)}, ${fallback})`;
    if (old) return quoteIdent(old.name);
    if (fallback) return fallback;
  }

  if (old) {
    if (isMoneyColumn(tableName, column.name)) {
      return toCentsExpr(old.name, old.type, legacyName);
    }
    if (isTimestampColumn(tableName, column.name)) return toTimestampExpr(old.name);
    return quoteIdent(old.name);
  }

  if (tableName === 'Budgets' && column.name === 'id') {
    const oldBudgetId = oldColumns.get('id_budget');
    if (oldBudgetId) return quoteIdent(oldBudgetId.name);
  }

  return defaultExpr(column);
};

const rebuildTable = async (db: SQLiteDatabase, table: TableDefinition) => {
  const tempName = `__legacy_${table.sqlName}`;
  const tempExists = await findTable(db, tempName);
  let actual = (await findTable(db, table.sqlName)) ?? (await findTable(db, table.name));

  if (tempExists) {
    if (actual && actual !== tempExists) {
      await db.execAsync(`DROP TABLE ${quoteIdent(actual)};`);
    }
    actual = tempExists;
  } else {
    if (!actual) {
      await db.execAsync(createTableSql(table));
      return;
    }
    await db.execAsync(`ALTER TABLE ${quoteIdent(actual)} RENAME TO ${quoteIdent(tempName)};`);
    actual = tempName;
  }

  await db.execAsync(createTableSql(table));

  const oldColumns = await getColumns(db, actual);
  const oldByName = new Map(oldColumns.map((column) => [column.name.toLowerCase(), column]));
  const legacyName = actual !== table.sqlName;

  const newColumns = table.columns.map((column) => quoteIdent(column.name)).join(', ');
  const expressions = table.columns
    .map((column) => copyColumnExpr(table, column, oldByName, legacyName))
    .join(', ');

  await db.execAsync(
    `INSERT OR IGNORE INTO ${quoteIdent(table.sqlName)} (${newColumns}) SELECT ${expressions} FROM ${quoteIdent(actual)};`
  );
  await db.execAsync(`DROP TABLE ${quoteIdent(actual)};`);
};

export const normalizeSchema = async (db: SQLiteDatabase) => {
  for (const tableName of TABLE_NAMES) {
    const table = APP_SCHEMA[tableName];
    if (await needsRebuild(db, table)) {
      await rebuildTable(db, table);
    }
  }
};

const REFERENCE_TABLES: TableName[] = [
  'PaymentTypes',
  'RecordTypes',
  'Categories',
  'PaymentMethods',
];

/**
 * Reference tables must be normalized and seeded before dependent tables are
 * rebuilt, because legacy columns such as `budget_type` or `payment_type`
 * are resolved by looking rows up in `record_types` / `payment_types`.
 */
export const prepareReferenceTables = async (db: SQLiteDatabase) => {
  for (const tableName of REFERENCE_TABLES) {
    const table = APP_SCHEMA[tableName];
    if (await needsRebuild(db, table)) {
      await rebuildTable(db, table);
    }
  }
  await seedReferenceData(db);
};

export const ensureSchema = async (db: SQLiteDatabase) => {
  await prepareReferenceTables(db);
  await normalizeSchema(db);
};

export const ensureIndexes = async (db: SQLiteDatabase) => {
  for (const tableName of TABLE_NAMES) {
    for (const sql of createIndexSql(APP_SCHEMA[tableName])) {
      await db.execAsync(sql);
    }
  }
};

export const ensureTimestampTriggers = async (db: SQLiteDatabase) => {
  for (const tableName of TABLE_NAMES) {
    for (const sql of createTimestampTriggerSql(APP_SCHEMA[tableName])) {
      await db.execAsync(sql);
    }
  }
};
