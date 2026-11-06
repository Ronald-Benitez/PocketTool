import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Removes the temporary legacy table created by `0004_budget_plans`.
 *
 * By version 5 every budget row has been copied to `budget_plans` and
 * `budget_lines`. Keeping the old table only adds noise to backups and exports.
 */
const up = async (db: SQLiteDatabase) => {
  await db.execAsync('DROP TABLE IF EXISTS "budgets_legacy";');
};

export default {
  version: 5,
  name: '0005_drop_budget_legacy',
  up,
};
