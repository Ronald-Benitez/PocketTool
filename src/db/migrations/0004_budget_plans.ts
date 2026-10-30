import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import {
  createIndexSql,
  createTableSql,
  createTimestampTriggerSql,
  nowMsSql,
  quoteIdent,
} from '../schema/sql';

type ColumnInfo = {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
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

const ensureColumns = async (
  db: SQLiteDatabase,
  table: string,
  columns: { name: string; sql: string }[]
) => {
  const existing = await columnsOf(db, table);
  const names = new Set(existing.map((column) => column.name));
  for (const column of columns) {
    if (names.has(column.name)) continue;
    await db.execAsync(
      `ALTER TABLE ${quoteIdent(table)} ADD COLUMN ${quoteIdent(column.name)} ${column.sql};`
    );
  }
};

const recordTypeLookup = async (db: SQLiteDatabase, value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value > 0 ? value : null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) return Number(text);

  const aliases: Record<string, string> = {
    income: 'Income',
    expense: 'Expense',
    transfer: 'Transfer',
    credit: 'Credit expenses',
    payments: 'Payments',
  };
  const target = aliases[text.toLowerCase()] ?? text;
  const row = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM ${quoteIdent(APP_SCHEMA.RecordTypes.sqlName)}
     WHERE lower(type_name) = lower(?) LIMIT 1`,
    [target]
  );
  return row?.id ?? null;
};

const planNameForGroup = async (db: SQLiteDatabase, groupId: number) => {
  const row = await db.getFirstAsync<{ group_name: string; month: number; year: number }>(
    `SELECT group_name, month, year FROM ${quoteIdent(APP_SCHEMA.Groups.sqlName)} WHERE id = ?`,
    [groupId]
  );
  if (!row) return null;
  return row.group_name || `${row.month}/${row.year}`;
};

const ensurePlan = async (db: SQLiteDatabase, groupId: number) => {
  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM ${quoteIdent(APP_SCHEMA.BudgetPlans.sqlName)}
     WHERE group_id = ? AND deleted_at IS NULL LIMIT 1`,
    [groupId]
  );
  if (existing?.id) return existing.id;

  const result = await db.runAsync(
    `INSERT INTO ${quoteIdent(APP_SCHEMA.BudgetPlans.sqlName)}
     (group_id, plan_name, status, alert_threshold_percent)
     VALUES (?, ?, 'active', 80)`,
    groupId,
    await planNameForGroup(db, groupId)
  );
  return result.lastInsertRowId;
};

/**
 * Converts the old flat `budgets` table into `budget_plans` + `budget_lines`.
 *
 * The old table is kept as `budgets_legacy` for one release. Rows without a
 * group cannot be assigned to a monthly plan; they stay in the legacy table and
 * are reported through the migration log.
 */
const up = async (db: SQLiteDatabase) => {
  await db.execAsync(createTableSql(APP_SCHEMA.BudgetPlans));
  await db.execAsync(createTableSql(APP_SCHEMA.BudgetLines));

  // A previous interrupted run may have left duplicate lines before the unique
  // indexes existed. Keep the newest one and soft-delete the rest.
  await db.execAsync(`
    UPDATE ${quoteIdent(APP_SCHEMA.BudgetLines.sqlName)}
    SET deleted_at = ${nowMsSql}
    WHERE deleted_at IS NULL
      AND scope = 'category'
      AND id NOT IN (
        SELECT MAX(id) FROM ${quoteIdent(APP_SCHEMA.BudgetLines.sqlName)}
        WHERE deleted_at IS NULL AND scope = 'category'
        GROUP BY budget_plan_id, category_id, record_type_id
      );
  `);
  await db.execAsync(`
    UPDATE ${quoteIdent(APP_SCHEMA.BudgetLines.sqlName)}
    SET deleted_at = ${nowMsSql}
    WHERE deleted_at IS NULL
      AND scope = 'fixed'
      AND fixed_id IS NOT NULL
      AND id NOT IN (
        SELECT MAX(id) FROM ${quoteIdent(APP_SCHEMA.BudgetLines.sqlName)}
        WHERE deleted_at IS NULL AND scope = 'fixed' AND fixed_id IS NOT NULL
        GROUP BY budget_plan_id, fixed_id
      );
  `);

  // Create the unique indexes before copying legacy rows so `INSERT OR IGNORE`
  // can deduplicate them. Dumps restore tables but not indexes, so this cannot
  // rely on the index already existing.
  for (const table of [APP_SCHEMA.BudgetPlans, APP_SCHEMA.BudgetLines]) {
    for (const sql of createIndexSql(table)) {
      await db.execAsync(sql);
    }
  }

  const templateTable = await tableExists(db, APP_SCHEMA.BudgetTemplates.sqlName);
  if (templateTable) {
    await ensureColumns(db, templateTable, [
      { name: 'is_default', sql: 'INTEGER DEFAULT 0' },
      { name: 'notes', sql: 'TEXT' },
    ]);
  }

  const templateItemsTable = await tableExists(db, APP_SCHEMA.BudgetTemplateItems.sqlName);
  if (templateItemsTable) {
    await ensureColumns(db, templateItemsTable, [
      { name: 'fixed_id', sql: 'INTEGER REFERENCES "fixed_records"("id") ON DELETE SET NULL' },
      { name: 'scope', sql: "TEXT NOT NULL DEFAULT 'category'" },
      { name: 'priority', sql: 'INTEGER NOT NULL DEFAULT 2' },
      { name: 'notes', sql: 'TEXT' },
      { name: 'sort_order', sql: 'INTEGER NOT NULL DEFAULT 0' },
    ]);
  }

  const legacyTable =
    (await tableExists(db, 'budgets')) ?? (await tableExists(db, 'budgets_legacy'));

  if (legacyTable) {
    const columns = await columnsOf(db, legacyTable);
    const byName = new Map(columns.map((column) => [column.name.toLowerCase(), column]));
    const amountColumn = byName.get('amount');
    const groupColumn = byName.get('group_id');
    const categoryColumn = byName.get('category_id');
    const typeColumn = byName.get('record_type_id');
    const legacyTypeColumn = byName.get('budget_type');
    const createdColumn = byName.get('created_at');
    const updatedColumn = byName.get('updated_at');
    const idColumn = byName.get('id') ?? byName.get('id_budget');

    if (amountColumn && groupColumn) {
      const rows = (await db.getAllAsync<Record<string, unknown>>(
        `SELECT * FROM ${quoteIdent(legacyTable)} ORDER BY ${quoteIdent(
          idColumn?.name ?? 'rowid'
        )} DESC`
      )) as Record<string, unknown>[];

      const amountNeedsCents =
        amountColumn.type.trim().toUpperCase() !== 'INTEGER';

      let migrated = 0;
      let orphaned = 0;

      for (const row of rows) {
        if (row.deleted_at) continue;
        const groupId = Number(row[groupColumn.name]);
        if (!Number.isFinite(groupId) || groupId <= 0) {
          orphaned += 1;
          continue;
        }

        const planId = await ensurePlan(db, groupId);
        const legacyTypeValue = legacyTypeColumn ? row[legacyTypeColumn.name] : null;
        const typeValue = typeColumn ? row[typeColumn.name] : null;
        const typeId = await recordTypeLookup(db, typeValue ?? legacyTypeValue);
        const categoryId = categoryColumn
          ? Number(row[categoryColumn.name]) || null
          : null;
        const rawAmount = Number(row[amountColumn.name] ?? 0);
        if (!Number.isFinite(rawAmount) || rawAmount <= 0) continue;
        const amount = amountNeedsCents
          ? Math.round(rawAmount * 100)
          : Math.round(rawAmount);

        await db.runAsync(
          `INSERT OR IGNORE INTO ${quoteIdent(APP_SCHEMA.BudgetLines.sqlName)}
           (budget_plan_id, category_id, record_type_id, scope, source,
            planned_amount, priority, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, 'category', 'manual', ?, 2, 0, ?, ?)`,
          planId,
          categoryId,
          typeId,
          amount,
          createdColumn ? (row[createdColumn.name] as number | null) : null,
          updatedColumn ? (row[updatedColumn.name] as number | null) : null
        );
        migrated += 1;
      }

      if (orphaned > 0) {
        console.warn(
          `[migration] ${orphaned} budget row(s) without group_id were kept in ${legacyTable}`
        );
      }
      if (migrated > 0) {
        console.info(`[migration] copied ${migrated} legacy budget row(s)`);
      }
    }

    if (legacyTable.toLowerCase() === 'budgets') {
      const legacyExists = await tableExists(db, 'budgets_legacy');
      if (!legacyExists) {
        await db.execAsync(`ALTER TABLE ${quoteIdent(legacyTable)} RENAME TO "budgets_legacy";`);
      }
    }
  }

  for (const table of [APP_SCHEMA.BudgetTemplates, APP_SCHEMA.BudgetTemplateItems, APP_SCHEMA.BudgetPlans, APP_SCHEMA.BudgetLines]) {
    for (const sql of createIndexSql(table)) {
      await db.execAsync(sql);
    }
    for (const sql of createTimestampTriggerSql(table)) {
      await db.execAsync(sql);
    }
  }
};

export default {
  version: 4,
  name: '0004_budget_plans',
  up,
};
