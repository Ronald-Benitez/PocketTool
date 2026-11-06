import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createTableSql, quoteIdent } from '../schema/sql';

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
  const table = APP_SCHEMA.Savings.sqlName;

  await addColumnIfMissing(db, table, 'target_amount_cents', 'INTEGER');
  await addColumnIfMissing(db, table, 'target_date', 'INTEGER');
  await addColumnIfMissing(db, table, 'status', "TEXT NOT NULL DEFAULT 'active'");
  await addColumnIfMissing(db, table, 'goal_reached_at', 'INTEGER');
  await addColumnIfMissing(db, table, 'goal_alerted_at', 'INTEGER');
  await addColumnIfMissing(db, table, 'archived_at', 'INTEGER');
  await addColumnIfMissing(db, table, 'records_mode', "TEXT NOT NULL DEFAULT 'separate'");
  await addColumnIfMissing(db, table, 'contribution_rule', "TEXT NOT NULL DEFAULT 'none'");
  await addColumnIfMissing(db, table, 'contribution_percent_bps', 'INTEGER');
  await addColumnIfMissing(db, table, 'contribution_amount_cents', 'INTEGER');
  await addColumnIfMissing(db, table, 'interest_rate_bps', 'INTEGER');
  await addColumnIfMissing(db, table, 'icon', 'TEXT');
  await addColumnIfMissing(db, table, 'color', 'TEXT');
  await addColumnIfMissing(db, table, 'own_amount_cents', 'INTEGER');
  await addColumnIfMissing(db, table, 'shared_amount_cents', 'INTEGER');

  await db.execAsync(createTableSql(APP_SCHEMA.SavingsSettings));

  await db.execAsync(`
    UPDATE ${quoteIdent(table)}
    SET status = COALESCE(status, 'active'),
        records_mode = COALESCE(records_mode, 'separate'),
        contribution_rule = COALESCE(contribution_rule, 'none'),
        own_amount_cents = COALESCE(own_amount_cents, amount),
        shared_amount_cents = COALESCE(shared_amount_cents, 0);
  `);

  await db.runAsync(
    `INSERT OR IGNORE INTO ${quoteIdent(APP_SCHEMA.SavingsSettings.sqlName)}
     (setting_key, trophy_color) VALUES ('savings', '#C9A227')`
  );
};

export default {
  version: 17,
  name: '0017_savings_goals_and_sharing',
  up,
};
