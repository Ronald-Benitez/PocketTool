import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { quoteIdent } from '../schema/sql';

/**
 * Records created from a savings movement are plain records: they keep the
 * category, payment method and type chosen by the user and must not be treated
 * as paid with the saving. Only records created from AddItem with an explicit
 * saving source keep `saving_id`.
 *
 * Migration 0019 backfilled `saving_id` from `savings_history.record_id`, which
 * also marked movement-created records. Their names start with `Saving · `, so
 * this cleanup restores the intended meaning without touching real
 * paid-with-saving records.
 */
const up = async (db: SQLiteDatabase) => {
  const records = APP_SCHEMA.Records.sqlName;
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${quoteIdent(records)})`
  );
  if (!columns.some((column) => column.name === 'saving_id')) return;

  await db.execAsync(`
    UPDATE ${quoteIdent(records)}
    SET saving_id = NULL
    WHERE saving_id IS NOT NULL
      AND record_name LIKE 'Saving · %';
  `);
};

export default {
  version: 20,
  name: '0020_clear_movement_saving_source',
  up,
};
