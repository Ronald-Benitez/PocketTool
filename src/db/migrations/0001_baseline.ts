import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureSchema } from '../schema/apply';

/**
 * Consolidated baseline. It creates/normalizes every table from the
 * declarative schema, including legacy conversions.
 */
const up = async (db: SQLiteDatabase) => {
  await ensureSchema(db);
};

export default {
  version: 1,
  name: '0001_baseline',
  up,
};
