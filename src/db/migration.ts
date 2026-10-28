import { type SQLiteDatabase } from 'expo-sqlite';
import {
  APP_SCHEMA,
  SCHEMA_VERSION,
  TABLE_NAMES,
  type TableDefinition,
  type TableName,
} from './schema';
import type { ColumnDefinition } from './types';
import { migrations } from './migrations';

type ColumnInfo = {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
};

const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;

const escapeSqlString = (value: string) => `'${value.replace(/'/g, "''")}'`;

const MONEY_COLUMNS: Partial<Record<TableName, string[]>> = {
  Groups: ['goal'],
  Fixed: ['fixed_amount'],
  Records: ['amount'],
  PaidCredits: ['amount'],
  BudgetTemplateItems: ['amount'],
  Budgets: ['amount'],
  Savings: ['amount'],
  SavingsHistory: ['previous_amount', 'new_amount'],
  FuelRefills: ['total_cost', 'price_per_gallon'],
};

const DATE_COLUMNS: Partial<Record<TableName, string[]>> = {
  Records: ['date'],
  PaidCredits: ['date'],
  SavingsHistory: ['change_date'],
  FuelRefills: ['date'],
  TripLogs: ['date'],
};

const columnDefinitionSql = (table: TableDefinition, column: ColumnDefinition) => {
  let sql = `${quoteIdent(column.name)} ${column.type}`;

  if (column.primaryKey) sql += ' PRIMARY KEY';
  if (column.autoIncrement) sql += ' AUTOINCREMENT';
  if (column.notNull) sql += ' NOT NULL';
  if (column.unique) sql += ' UNIQUE';

  if (column.defaultValue !== undefined) {
    if (column.defaultValue === null) {
      sql += ' DEFAULT NULL';
    } else if (typeof column.defaultValue === 'string') {
      sql += ` DEFAULT ${escapeSqlString(column.defaultValue)}`;
    } else {
      sql += ` DEFAULT ${column.defaultValue}`;
    }
  }

  if (column.references) {
    const target = APP_SCHEMA[column.references.table as TableName];
    sql += ` REFERENCES ${quoteIdent(target.sqlName)}(${quoteIdent(column.references.column)})`;
    if (column.references.onDelete) {
      sql += ` ON DELETE ${column.references.onDelete}`;
    }
  }

  return sql;
};

const createTableSql = (table: TableDefinition) => {
  const columns = table.columns.map((column) => columnDefinitionSql(table, column)).join(', ');
  return `CREATE TABLE IF NOT EXISTS ${quoteIdent(table.sqlName)} (${columns});`;
};

const createIndexSql = (table: TableDefinition) => {
  if (!table.indexes?.length) return [];
  return table.indexes.map((index) => {
    const unique = index.unique ? 'UNIQUE ' : '';
    const columns = index.columns.map(quoteIdent).join(', ');
    const where = index.where ? ` WHERE ${index.where}` : '';
    return `CREATE ${unique}INDEX IF NOT EXISTS ${quoteIdent(index.name)} ON ${quoteIdent(table.sqlName)} (${columns})${where};`;
  });
};

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
  if (columnName === 'deleted_at') return true;
  if (MONEY_COLUMNS[table]?.includes(columnName)) return true;
  if (DATE_COLUMNS[table]?.includes(columnName)) return true;
  return false;
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
    if (column.name === 'deleted_at') return toTimestampExpr(old.name);
    if (MONEY_COLUMNS[tableName]?.includes(column.name)) {
      return toCentsExpr(old.name, old.type, legacyName);
    }
    if (DATE_COLUMNS[tableName]?.includes(column.name)) return toTimestampExpr(old.name);
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

const normalizeSchema = async (db: SQLiteDatabase) => {
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
const prepareReferenceTables = async (db: SQLiteDatabase) => {
  for (const tableName of REFERENCE_TABLES) {
    const table = APP_SCHEMA[tableName];
    if (await needsRebuild(db, table)) {
      await rebuildTable(db, table);
    }
  }
  await seedReferenceData(db);
};

const ensureIndexes = async (db: SQLiteDatabase) => {
  for (const tableName of TABLE_NAMES) {
    for (const sql of createIndexSql(APP_SCHEMA[tableName])) {
      await db.execAsync(sql);
    }
  }
};

const seedReferenceData = async (db: SQLiteDatabase) => {
  const paymentTypes = [
    ['Credit', '#4CAF50'],
    ['Debit', '#2196F3'],
  ];
  for (const [name, color] of paymentTypes) {
    await db.runAsync(
      `INSERT INTO ${quoteIdent(APP_SCHEMA.PaymentTypes.sqlName)} (payment_type_name, payment_color)
       SELECT ?, ? WHERE NOT EXISTS (
         SELECT 1 FROM ${quoteIdent(APP_SCHEMA.PaymentTypes.sqlName)} WHERE lower(payment_type_name) = lower(?)
       )`,
      name,
      color,
      name
    );
  }

  const recordTypes = [
    ['Income', '+', '#4CAF50'],
    ['Expense', '-', '#F44336'],
    ['Transfer', '=', '#FF9800'],
    ['Credit expenses', '=', '#9C27B0'],
    ['Payments', '-', '#F44376'],
  ];
  for (const [name, effect, color] of recordTypes) {
    await db.runAsync(
      `INSERT INTO ${quoteIdent(APP_SCHEMA.RecordTypes.sqlName)} (type_name, effect, record_color)
       SELECT ?, ?, ? WHERE NOT EXISTS (
         SELECT 1 FROM ${quoteIdent(APP_SCHEMA.RecordTypes.sqlName)} WHERE lower(type_name) = lower(?)
       )`,
      name,
      effect,
      color,
      name
    );
  }

  const categories = ['Groceries', 'Gas', 'Entertainment', 'Utilities', 'Rent', 'Salary'];
  for (const name of categories) {
    await db.runAsync(
      `INSERT INTO ${quoteIdent(APP_SCHEMA.Categories.sqlName)} (category_name)
       SELECT ? WHERE NOT EXISTS (
         SELECT 1 FROM ${quoteIdent(APP_SCHEMA.Categories.sqlName)} WHERE lower(category_name) = lower(?)
       )`,
      name,
      name
    );
  }

  const paymentMethods: Array<[string, number, string]> = [
    ['Visa', 15, 'Credit'],
    ['MasterCard', 20, 'Credit'],
    ['Cash', 0, 'Debit'],
    ['Bank Transfer', 0, 'Debit'],
  ];
  for (const [name, closingDate, typeName] of paymentMethods) {
    const typeRow = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM ${quoteIdent(APP_SCHEMA.PaymentTypes.sqlName)} WHERE lower(payment_type_name) = lower(?)`,
      [typeName]
    );
    await db.runAsync(
      `INSERT INTO ${quoteIdent(APP_SCHEMA.PaymentMethods.sqlName)} (method_name, closing_date, payment_type_id)
       SELECT ?, ?, ? WHERE NOT EXISTS (
         SELECT 1 FROM ${quoteIdent(APP_SCHEMA.PaymentMethods.sqlName)} WHERE lower(method_name) = lower(?)
       )`,
      name,
      closingDate,
      typeRow?.id ?? null,
      name
    );
  }
};

const seedSampleData = async (db: SQLiteDatabase) => {
  const groupCount = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM ${quoteIdent(APP_SCHEMA.Groups.sqlName)}`
  );
  const recordCount = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM ${quoteIdent(APP_SCHEMA.Records.sqlName)}`
  );

  if ((groupCount?.total ?? 0) > 0 || (recordCount?.total ?? 0) > 0) {
    return;
  }

  const now = new Date();
  const result = await db.runAsync(
    `INSERT INTO ${quoteIdent(APP_SCHEMA.Groups.sqlName)} (group_name, goal, year, month)
     VALUES (?, ?, ?, ?)`,
    'Default Group',
    500000,
    now.getFullYear(),
    now.getMonth() + 1
  );
  const groupId = result.lastInsertRowId;

  const lookupId = async (table: TableName, nameColumn: string, name: string) => {
    const row = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM ${quoteIdent(APP_SCHEMA[table].sqlName)} WHERE lower(${quoteIdent(nameColumn)}) = lower(?)`,
      [name]
    );
    return row?.id ?? null;
  };

  const incomeId = await lookupId('RecordTypes', 'type_name', 'Income');
  const expenseId = await lookupId('RecordTypes', 'type_name', 'Expense');
  const groceriesId = await lookupId('Categories', 'category_name', 'Groceries');
  const gasId = await lookupId('Categories', 'category_name', 'Gas');
  const entertainmentId = await lookupId('Categories', 'category_name', 'Entertainment');
  const rentId = await lookupId('Categories', 'category_name', 'Rent');
  const salaryId = await lookupId('Categories', 'category_name', 'Salary');
  const visaId = await lookupId('PaymentMethods', 'method_name', 'Visa');
  const cashId = await lookupId('PaymentMethods', 'method_name', 'Cash');
  const bankTransferId = await lookupId('PaymentMethods', 'method_name', 'Bank Transfer');

  const records: Array<[number, string, number, number | null, number | null, number | null]> = [
    [100000, 'Salary for January', incomeId ?? 0, salaryId, visaId, groupId],
    [20000, 'Groceries', expenseId ?? 0, groceriesId, cashId, groupId],
    [15000, 'Gas', expenseId ?? 0, gasId, cashId, groupId],
    [10000, 'Entertainment', expenseId ?? 0, entertainmentId, bankTransferId, groupId],
    [120000, 'Rent for January', expenseId ?? 0, rentId, bankTransferId, groupId],
  ];

  for (const [amount, name, recordTypeId, categoryId, paymentMethodId, group] of records) {
    await db.runAsync(
      `INSERT INTO ${quoteIdent(APP_SCHEMA.Records.sqlName)}
       (amount, record_name, date, record_type_id, group_id, category_id, payment_method_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      amount,
      name,
      now.getTime(),
      recordTypeId,
      group,
      categoryId,
      paymentMethodId
    );
  }
};

const seedDefaults = async (db: SQLiteDatabase) => {
  await db.withTransactionAsync(async () => {
    await seedReferenceData(db);
    await seedSampleData(db);
  });
};

const getUserVersion = async (db: SQLiteDatabase) => {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
};

export const runMigrations = async (db: SQLiteDatabase) => {
  let version = await getUserVersion(db);

  for (const migration of migrations) {
    if (migration.version <= version) continue;

    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.runAsync(
        `INSERT OR IGNORE INTO ${quoteIdent(APP_SCHEMA.Migrations.sqlName)} (migration_name, applied_at) VALUES (?, ?)`,
        migration.name,
        Date.now()
      );
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });

    version = migration.version;
  }
};

async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = OFF;');
  // Prevent ALTER TABLE ... RENAME from rewriting foreign keys in other
  // tables while a legacy table is being rebuilt.
  await db.execAsync('PRAGMA legacy_alter_table = ON;');

  try {
    await db.withTransactionAsync(async () => {
      await prepareReferenceTables(db);
      await normalizeSchema(db);
    });
  } finally {
    await db.execAsync('PRAGMA legacy_alter_table = OFF;');
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }

  await ensureIndexes(db);
  await seedDefaults(db);

  const currentVersion = await getUserVersion(db);
  if (currentVersion < SCHEMA_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }

  await runMigrations(db);
}

export default migrateDb;
