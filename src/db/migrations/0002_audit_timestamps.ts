import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA, TABLE_NAMES } from '../schema/tables';
import { quoteIdent } from '../schema/sql';

/**
 * Adds audit timestamps to the consolidated baseline tables.
 * New databases already get them from `0001_baseline`; this migration covers
 * databases created before the audit columns existed.
 */
const up = async (db: SQLiteDatabase) => {
  for (const tableName of TABLE_NAMES) {
    const table = APP_SCHEMA[tableName];
    const auditColumns = table.columns.filter(
      (column) => column.name === 'created_at' || column.name === 'updated_at'
    );

    if (auditColumns.length === 0) continue;

    const existing = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(${quoteIdent(table.sqlName)})`
    );
    const existingNames = new Set(existing.map((column) => column.name));

    for (const column of auditColumns) {
      if (!existingNames.has(column.name)) {
        await db.execAsync(
          `ALTER TABLE ${quoteIdent(table.sqlName)} ADD COLUMN ${quoteIdent(column.name)} INTEGER;`
        );
      }
    }
  }
};

export default {
  version: 2,
  name: '0002_audit_timestamps',
  up,
};
