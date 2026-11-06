import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { quoteIdent } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  const table = APP_SCHEMA.VehicleSettings.sqlName;
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${quoteIdent(table)})`
  );
  if (columns.some((column) => column.name === 'record_type_id')) return;

  await db.execAsync(
    `ALTER TABLE ${quoteIdent(table)} ADD COLUMN ${quoteIdent('record_type_id')} INTEGER REFERENCES ${quoteIdent(
      APP_SCHEMA.RecordTypes.sqlName
    )}(${quoteIdent('id')});`
  );
};

export default {
  version: 13,
  name: '0013_vehicle_settings_record_type',
  up,
};
