import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureTimestampTriggers } from '../schema/apply';

/**
 * Adds created_at/updated_at triggers to databases created before them.
 */
const up = async (db: SQLiteDatabase) => {
  await ensureTimestampTriggers(db);
};

export default {
  version: 3,
  name: '0003_timestamp_triggers',
  up,
};
