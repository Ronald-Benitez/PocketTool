import type { SQLiteDatabase } from 'expo-sqlite';

import { backfillAuditTimestamps, ensureTimestampTriggers } from '../schema/apply';

/**
 * Adds created_at/updated_at triggers to databases created before them and
 * fills existing null audit timestamps.
 */
const up = async (db: SQLiteDatabase) => {
  await backfillAuditTimestamps(db);
  await ensureTimestampTriggers(db);
};

export default {
  version: 3,
  name: '0003_timestamp_triggers',
  up,
};
