import { type SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA, SCHEMA_VERSION } from './schema';
import { migrations } from './migrations';
import { withExclusiveTransaction } from './transaction';
import { ensureIndexes, ensureSchema, ensureTimestampTriggers } from './schema/apply';
import { seedDefaults } from './schema/seed';
import { createTableSql, quoteIdent } from './schema/sql';

const getUserVersion = async (db: SQLiteDatabase) => {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
};

export const runMigrations = async (db: SQLiteDatabase) => {
  let version = await getUserVersion(db);

  for (const migration of migrations) {
    if (migration.version <= version) continue;

    await withExclusiveTransaction(db, async (txn) => {
      await txn.execAsync('PRAGMA legacy_alter_table = ON;');
      try {
        await migration.up(txn);
      } finally {
        await txn.execAsync('PRAGMA legacy_alter_table = OFF;');
      }
    });

    // Only record the migration after its transaction has committed.
    await withExclusiveTransaction(db, async (txn) => {
      await txn.runAsync(
        `INSERT OR IGNORE INTO ${quoteIdent(APP_SCHEMA.Migrations.sqlName)} (migration_name, applied_at) VALUES (?, ?)`,
        migration.name,
        Date.now()
      );
      await txn.execAsync(`PRAGMA user_version = ${migration.version}`);
    });

    version = migration.version;
  }
};

async function migrateDb(db: SQLiteDatabase) {
  try {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  } catch (error) {
    // WAL is not available on every platform (for example some web builds).
    console.warn('No se pudo activar journal_mode=WAL:', error);
  }

  await db.execAsync('PRAGMA foreign_keys = OFF;');

  try {
    // The runner needs the history table before applying the baseline.
    await db.execAsync(createTableSql(APP_SCHEMA.Migrations));

    await runMigrations(db);
    await ensureIndexes(db);
    await ensureTimestampTriggers(db);
    await seedDefaults(db);
  } finally {
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }

  const currentVersion = await getUserVersion(db);
  if (currentVersion < SCHEMA_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}

export default migrateDb;
