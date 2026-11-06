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

const rowCount = async (db: SQLiteDatabase, table: string) => {
  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM ${quoteIdent(table)}`
  );
  return row?.total ?? 0;
};

const removeLegacyTables = async (db: SQLiteDatabase) => {
  for (const table of ['fuel_refills', 'trip_logs']) {
    const actual = await tableExists(db, table);
    if (!actual) continue;

    const total = await rowCount(db, actual);
    const legacy = `${table}_legacy`;
    if (total > 0 && !(await tableExists(db, legacy))) {
      await db.execAsync(
        `ALTER TABLE ${quoteIdent(actual)} RENAME TO ${quoteIdent(legacy)};`
      );
    } else {
      await db.execAsync(`DROP TABLE ${quoteIdent(actual)};`);
    }
  }
};

const seedSettings = async (db: SQLiteDatabase) => {
  const keys = [
    'fuel',
    'maintenance',
    'repair',
    'tires',
    'oil_change',
    'insurance',
    'inspection',
    'other',
  ];
  for (const key of keys) {
    await db.runAsync(
      `INSERT OR IGNORE INTO ${quoteIdent(APP_SCHEMA.VehicleSettings.sqlName)}
       (setting_key) VALUES (?)`,
      key
    );
  }
};

/**
 * Replaces the old fuel_refills/trip_logs model with the vehicle module.
 * The old tables had no users, but if rows are found they are preserved as
 * `*_legacy` instead of being silently migrated into a model with different
 * units and semantics.
 */
const up = async (db: SQLiteDatabase) => {
  await removeLegacyTables(db);

  const tables = [
    APP_SCHEMA.Vehicles,
    APP_SCHEMA.VehicleFuelEntries,
    APP_SCHEMA.VehicleMaintenance,
    APP_SCHEMA.VehicleMaintenanceItems,
    APP_SCHEMA.VehicleReminders,
    APP_SCHEMA.VehicleSettings,
    APP_SCHEMA.VehicleExpenseLinks,
  ];

  for (const table of tables) {
    await db.execAsync(createTableSql(table));
    for (const sql of createIndexSql(table)) {
      await db.execAsync(sql);
    }
    for (const sql of createTimestampTriggerSql(table)) {
      await db.execAsync(sql);
    }
  }

  await seedSettings(db);
};

export default {
  version: 7,
  name: '0007_vehicle_module',
  up,
};
